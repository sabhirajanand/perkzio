import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { Customer } from '../../../../entities/Customer.js';
import { CustomerCardEnrolment } from '../../../../entities/CustomerCardEnrolment.js';
import { LoyaltyCard } from '../../../../entities/LoyaltyCard.js';
import { StampEvent } from '../../../../entities/StampEvent.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';

const listCustomersQuery = z.object({
  q: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function listCustomers(req: Request, res: Response): Promise<void> {
  const parsed = listCustomersQuery.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid query', parsed.error.flatten());
  }
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const q = parsed.data.q?.toLowerCase() ?? null;
  const ds = getDataSource();

  const base = ds
    .getRepository(Customer)
    .createQueryBuilder('c')
    .innerJoin(StampEvent, 'se', 'se.customer_id = c.id AND se.merchant_id = :merchantId', {
      merchantId: auth.merchantId,
    })
    .where('c.deleted_at IS NULL');

  if (q) {
    base.andWhere(
      '(c.phone_e164 ILIKE :q OR c.email ILIKE :q OR c.first_name ILIKE :q OR c.last_name ILIKE :q)',
      { q: `%${q}%` },
    );
  }

  const totalRow = await base
    .clone()
    .select('COUNT(DISTINCT c.id)', 'count')
    .getRawOne<{ count: string }>();
  const total = Number(totalRow?.count ?? 0);

  const rows = await base
    .select([
      'c.id AS id',
      'c.phone_e164 AS phoneE164',
      'c.email AS email',
      'c.first_name AS firstName',
      'c.last_name AS lastName',
      'c.status AS status',
      'c.created_at AS createdAt',
      'c.updated_at AS updatedAt',
      'MAX(se.occurred_at) AS lastStampAt',
    ])
    .groupBy('c.id')
    .orderBy('MAX(se.occurred_at)', 'DESC')
    .limit(parsed.data.limit)
    .offset(parsed.data.offset)
    .getRawMany<{
      id: string;
      phoneE164: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
      lastStampAt: string | null;
    }>();

  res.status(200).json({
    total,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
    customers: rows.map((r) => ({
      id: r.id,
      phoneE164: r.phoneE164,
      email: r.email,
      firstName: r.firstName,
      lastName: r.lastName,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      lastStampAt: r.lastStampAt,
    })),
  });
}

const customerIdParams = z.object({ customerId: z.string().uuid() });

export async function getCustomer(req: Request, res: Response): Promise<void> {
  const parsed = customerIdParams.safeParse(req.params);
  if (!parsed.success) {
    throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());
  }
  const auth = req.auth?.merchant;
  if (!auth) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Unauthenticated');

  const ds = getDataSource();
  const customer = await ds.getRepository(Customer).findOne({ where: { id: parsed.data.customerId } });
  if (!customer || customer.deletedAt) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Customer not found');

  const belongsRow = await ds
    .getRepository(StampEvent)
    .createQueryBuilder('se')
    .select('se.id', 'id')
    .where('se.customer_id = :customerId', { customerId: customer.id })
    .andWhere('se.merchant_id = :merchantId', { merchantId: auth.merchantId })
    .limit(1)
    .getRawOne<{ id: string }>();
  if (!belongsRow) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Customer not found');

  const enrolments = await ds
    .getRepository(CustomerCardEnrolment)
    .createQueryBuilder('e')
    .innerJoin(LoyaltyCard, 'lc', 'lc.id = e.loyalty_card_id')
    .where('e.customer_id = :customerId', { customerId: customer.id })
    .andWhere('lc.merchant_id = :merchantId', { merchantId: auth.merchantId })
    .andWhere('e.deleted_at IS NULL')
    .select([
      'e.id AS id',
      'e.enrolled_at AS enrolledAt',
      'e.last_activity_at AS lastActivityAt',
      'e.current_stamp_count AS currentStampCount',
      'lc.id AS loyaltyCardId',
      'lc.name AS loyaltyCardName',
      'lc.status AS loyaltyCardStatus',
    ])
    .orderBy('e.enrolled_at', 'DESC')
    .getRawMany<{
      id: string;
      enrolledAt: string;
      lastActivityAt: string | null;
      currentStampCount: number;
      loyaltyCardId: string;
      loyaltyCardName: string;
      loyaltyCardStatus: string;
    }>();

  res.status(200).json({
    customer: {
      id: customer.id,
      phoneE164: customer.phoneE164,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    },
    enrolments,
  });
}

