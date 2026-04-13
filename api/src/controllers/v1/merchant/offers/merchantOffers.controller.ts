import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Branch } from '../../../../entities/Branch.js';
import { OfferRedemption } from '../../../../entities/OfferRedemption.js';
import { SpecialOffer } from '../../../../entities/SpecialOffer.js';
import { SpecialOfferBranchScope } from '../../../../entities/SpecialOfferBranchScope.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const listOffersQuery = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function listOffers(req: Request, res: Response): Promise<void> {
  const parsed = listOffersQuery.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid query', parsed.error.flatten());
  }
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const q = parsed.data.q?.toLowerCase() ?? null;
  const status = parsed.data.status ?? null;
  const ds = getDataSource();

  const base = ds
    .getRepository(SpecialOffer)
    .createQueryBuilder('o')
    .innerJoin('o.merchant', 'm')
    .where('m.id = :merchantId', { merchantId: auth.merchantId });

  if (auth.role === 'BRANCH_ADMIN' && auth.branchId) {
    base.innerJoin(SpecialOfferBranchScope, 'bs', 'bs.offer_id = o.id AND bs.branch_id = :branchId', {
      branchId: auth.branchId,
    });
  }

  if (q) {
    base.andWhere('(o.title ILIKE :q OR o.description ILIKE :q)', { q: `%${q}%` });
  }
  if (status) {
    base.andWhere('o.status = :status', { status });
  }

  const totalRow = await base
    .clone()
    .select('COUNT(DISTINCT o.id)', 'count')
    .getRawOne<{ count: string }>();
  const total = Number(totalRow?.count ?? 0);

  const offers = await base
    .select([
      'o.id AS id',
      'o.title AS title',
      'o.status AS status',
      'o.valid_from AS validFrom',
      'o.valid_to AS validTo',
      'o.audience_type AS audienceType',
      'o.created_at AS createdAt',
      'o.updated_at AS updatedAt',
    ])
    .orderBy('o.created_at', 'DESC')
    .limit(parsed.data.limit)
    .offset(parsed.data.offset)
    .getRawMany<{
      id: string;
      title: string;
      status: string;
      validFrom: string;
      validTo: string;
      audienceType: string;
      createdAt: string;
      updatedAt: string;
    }>();

  const ids = offers.map((o) => o.id);
  const redemptionCounts = ids.length
    ? await ds
        .getRepository(OfferRedemption)
        .createQueryBuilder('r')
        .select('r.offer_id', 'offerId')
        .addSelect('COUNT(*)', 'count')
        .where('r.offer_id IN (:...ids)', { ids })
        .groupBy('r.offer_id')
        .getRawMany<{ offerId: string; count: string }>()
    : [];
  const countsMap = new Map(redemptionCounts.map((r) => [r.offerId, Number(r.count)]));

  res.status(200).json({
    total,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
    offers: offers.map((o) => ({ ...o, redemptionCount: countsMap.get(o.id) ?? 0 })),
  });
}

const createOfferBody = z.object({
  title: z.string().trim().min(2).max(255),
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  termsHtml: z.string().trim().min(1).max(10000).nullable().optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  audienceType: z.string().trim().min(1).max(64).default('ALL'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).default('DRAFT'),
  branchIds: z.array(z.string().uuid()).optional(),
});

export async function createOffer(req: Request, res: Response): Promise<void> {
  const parsed = createOfferBody.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const ds = getDataSource();
  const validFrom = new Date(parsed.data.validFrom);
  const validTo = new Date(parsed.data.validTo);
  if (!(validFrom < validTo)) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, '`validTo` must be after `validFrom`');
  }

  await ds.transaction(async (tx) => {
    const offerRepo = tx.getRepository(SpecialOffer);
    const branchRepo = tx.getRepository(Branch);
    const scopeRepo = tx.getRepository(SpecialOfferBranchScope);

    const offer = offerRepo.create({
      merchant: { id: auth.merchantId } as never,
      loyaltyCard: null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      termsHtml: parsed.data.termsHtml ?? null,
      imageS3Key: null,
      validFrom,
      validTo,
      audienceType: parsed.data.audienceType,
      status: parsed.data.status,
    });
    await offerRepo.save(offer);

    const branchIds =
      auth.role === 'BRANCH_ADMIN' && auth.branchId ? [auth.branchId] : (parsed.data.branchIds ?? []);
    if (branchIds.length > 0) {
      const branches = await branchRepo
        .createQueryBuilder('b')
        .innerJoin('b.merchant', 'm')
        .where('m.id = :merchantId', { merchantId: auth.merchantId })
        .andWhere('b.id IN (:...branchIds)', { branchIds })
        .getMany();
      if (branches.length !== branchIds.length) {
        throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid branch scope');
      }
      await scopeRepo.insert(branchIds.map((branchId) => scopeRepo.create({ offerId: offer.id, branchId })));
    }

    res.status(201).json({ offerId: offer.id });
  });
}

const offerIdParams = z.object({ offerId: z.string().uuid() });

export async function getOffer(req: Request, res: Response): Promise<void> {
  const parsed = offerIdParams.safeParse(req.params);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const ds = getDataSource();
  const offer = await ds.getRepository(SpecialOffer).findOne({
    where: { id: parsed.data.offerId },
    relations: { merchant: true },
  });
  if (!offer || offer.merchant.id !== auth.merchantId) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Offer not found');

  if (auth.role === 'BRANCH_ADMIN' && auth.branchId) {
    const scoped = await ds.getRepository(SpecialOfferBranchScope).findOne({
      where: { offerId: offer.id, branchId: auth.branchId },
    });
    if (!scoped) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Offer not found');
  }

  const scopes = await ds.getRepository(SpecialOfferBranchScope).find({ where: { offerId: offer.id } });
  res.status(200).json({
    offer: {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      termsHtml: offer.termsHtml,
      imageS3Key: offer.imageS3Key,
      validFrom: offer.validFrom.toISOString(),
      validTo: offer.validTo.toISOString(),
      audienceType: offer.audienceType,
      status: offer.status,
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
    },
    branchIds: scopes.map((s) => s.branchId),
  });
}

const updateOfferBody = z.object({
  title: z.string().trim().min(2).max(255).optional(),
  description: z.string().trim().min(1).max(2000).nullable().optional(),
  termsHtml: z.string().trim().min(1).max(10000).nullable().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  audienceType: z.string().trim().min(1).max(64).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).optional(),
  branchIds: z.array(z.string().uuid()).optional(),
});

export async function updateOffer(req: Request, res: Response): Promise<void> {
  const p1 = offerIdParams.safeParse(req.params);
  const p2 = updateOfferBody.safeParse(req.body);
  if (!p1.success || !p2.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', {
      params: p1.success ? undefined : p1.error.flatten(),
      body: p2.success ? undefined : p2.error.flatten(),
    });
  }
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const ds = getDataSource();
  await ds.transaction(async (tx) => {
    const offerRepo = tx.getRepository(SpecialOffer);
    const branchRepo = tx.getRepository(Branch);
    const scopeRepo = tx.getRepository(SpecialOfferBranchScope);

    const offer = await offerRepo.findOne({ where: { id: p1.data.offerId }, relations: { merchant: true } });
    if (!offer || offer.merchant.id !== auth.merchantId) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Offer not found');

    if (auth.role === 'BRANCH_ADMIN') {
      if (p2.data.branchIds) throw new AppError(403, ErrorCodes.FORBIDDEN, 'Branch scope not allowed');
    }

    if (typeof p2.data.title === 'string') offer.title = p2.data.title;
    if (p2.data.description !== undefined) offer.description = p2.data.description ?? null;
    if (p2.data.termsHtml !== undefined) offer.termsHtml = p2.data.termsHtml ?? null;
    if (typeof p2.data.audienceType === 'string') offer.audienceType = p2.data.audienceType;
    if (typeof p2.data.status === 'string') offer.status = p2.data.status;

    if (p2.data.validFrom) offer.validFrom = new Date(p2.data.validFrom);
    if (p2.data.validTo) offer.validTo = new Date(p2.data.validTo);
    if (!(offer.validFrom < offer.validTo)) {
      throw new AppError(422, ErrorCodes.VALIDATION_ERROR, '`validTo` must be after `validFrom`');
    }

    await offerRepo.save(offer);

    if (p2.data.branchIds) {
      const branchIds = p2.data.branchIds;
      const branches = await branchRepo
        .createQueryBuilder('b')
        .innerJoin('b.merchant', 'm')
        .where('m.id = :merchantId', { merchantId: auth.merchantId })
        .andWhere('b.id IN (:...branchIds)', { branchIds })
        .getMany();
      if (branches.length !== branchIds.length) {
        throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid branch scope');
      }
      await scopeRepo.delete({ offerId: offer.id });
      await scopeRepo.insert(branchIds.map((branchId) => scopeRepo.create({ offerId: offer.id, branchId })));
    }

    res.status(200).json({ ok: true });
  });
}

