import type { Request, Response } from 'express';
import { z } from 'zod';

import { getDataSource } from '../../../../config/database.js';
import { MerchantOnboardingApplication } from '../../../../entities/MerchantOnboardingApplication.js';
import { PlatformStaff } from '../../../../entities/PlatformStaff.js';
import { AppError } from '../../../../errors/AppError.js';
import { ErrorCodes } from '../../../../errors/codes.js';
import { sendEmail } from '../../../../lib/notifications/email.js';
import { provisionMerchantFromApplication } from '../../../../services/merchantOnboarding/provisionMerchantFromApplication.js';

const listSchema = z.object({
  status: z.string().optional(),
});

const updateSchema = z.object({
  businessName: z.string().min(2).optional(),
  category: z.string().min(1).optional(),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).max(15).optional(),
  pan: z.string().min(1).optional(),
  gstin: z.string().optional(),
  addressLine1: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  pinCode: z.string().min(1).optional(),
  mapsUrl: z.string().min(1).optional(),
  plan: z.enum(['LITE', 'GROWTH', 'PRO']).optional(),
  outletsCount: z.number().int().min(1).max(200).optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  googleBusinessUrl: z.string().optional(),
});

function pickSummary(app: MerchantOnboardingApplication) {
  const payload = app.businessPayload && typeof app.businessPayload === 'object' ? (app.businessPayload as Record<string, unknown>) : {};
  return {
    id: app.id,
    referenceNumber: app.referenceNumber,
    status: app.status,
    createdAt: app.createdAt,
    businessName: typeof payload.businessName === 'string' ? payload.businessName : null,
    contactEmail: typeof payload.contactEmail === 'string' ? payload.contactEmail : null,
    contactPhone: typeof payload.contactPhone === 'string' ? payload.contactPhone : null,
    plan: typeof payload.plan === 'string' ? payload.plan : null,
    outletsCount: typeof payload.outletsCount === 'number' ? payload.outletsCount : null,
  };
}

export async function listMerchantApplications(req: Request, res: Response): Promise<void> {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  const repo = ds.getRepository(MerchantOnboardingApplication);

  const qb = repo.createQueryBuilder('a').orderBy('a.createdAt', 'DESC');
  if (parsed.data.status) qb.where('a.status = :status', { status: parsed.data.status });

  const rows = await qb.take(50).getMany();
  res.json({ ok: true, applications: rows.map(pickSummary) });
}

export async function getMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const ds = getDataSource();
  const repo = ds.getRepository(MerchantOnboardingApplication);
  const application = await repo.findOne({ where: { id: applicationId }, relations: { selectedPlan: true, merchant: true, reviewedByStaff: true } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  res.json({ ok: true, application });
}

export async function updateMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(422, ErrorCodes.VALIDATION_ERROR, 'Invalid request', parsed.error.flatten());

  const ds = getDataSource();
  const repo = ds.getRepository(MerchantOnboardingApplication);
  const application = await repo.findOne({ where: { id: applicationId } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  if (application.status !== 'SUBMITTED' && application.status !== 'PAYMENT_PENDING') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Only pending applications can be edited');
  }

  const existingPayload = application.businessPayload && typeof application.businessPayload === 'object' ? (application.businessPayload as Record<string, unknown>) : {};
  const nextPayload = { ...existingPayload, ...parsed.data };
  if (typeof parsed.data.contactEmail === 'string') nextPayload.contactEmail = parsed.data.contactEmail.toLowerCase();
  application.businessPayload = nextPayload;
  await repo.save(application);
  res.json({ ok: true, application });
}

export async function approveMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const staffId = req.auth?.staff?.staffId ?? null;
  if (!staffId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing staff session');

  const ds = getDataSource();
  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const staffRepo = ds.getRepository(PlatformStaff);

  const application = await appRepo.findOne({ where: { id: applicationId }, relations: { selectedPlan: true, merchant: true } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  if (application.status !== 'SUBMITTED') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Only SUBMITTED applications can be approved');
  }
  if (application.merchant) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Application already provisioned');
  }

  const reviewer = await staffRepo.findOne({ where: { id: staffId } });
  if (!reviewer) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid staff session');

  const { merchant, merchantAdminUser } = await provisionMerchantFromApplication({ application });

  application.status = 'APPROVED';
  application.merchant = merchant;
  application.reviewedByStaff = reviewer;
  application.reviewedAt = new Date();
  await appRepo.save(application);

  await sendEmail({
    to: [merchantAdminUser.email],
    subject: `Perkzio: Application approved (${application.referenceNumber})`,
    text: `Your merchant registration has been approved.\n\nReference: ${application.referenceNumber}\nLogin email: ${merchantAdminUser.email}\n\nYou can now log in to the merchant portal using the password you set during registration.`,
  });

  res.json({ ok: true, status: application.status, merchantId: merchant.id });
}

export async function rejectMerchantApplication(req: Request, res: Response): Promise<void> {
  const applicationId = z.string().uuid().parse(req.params.applicationId);
  const staffId = req.auth?.staff?.staffId ?? null;
  if (!staffId) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing staff session');

  const ds = getDataSource();
  const appRepo = ds.getRepository(MerchantOnboardingApplication);
  const staffRepo = ds.getRepository(PlatformStaff);

  const application = await appRepo.findOne({ where: { id: applicationId } });
  if (!application) throw new AppError(404, ErrorCodes.NOT_FOUND, 'Application not found');
  if (application.status !== 'SUBMITTED') {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Only SUBMITTED applications can be rejected');
  }

  const reviewer = await staffRepo.findOne({ where: { id: staffId } });
  if (!reviewer) throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid staff session');

  application.status = 'REJECTED';
  application.reviewedByStaff = reviewer;
  application.reviewedAt = new Date();
  await appRepo.save(application);

  const payload = application.businessPayload && typeof application.businessPayload === 'object' ? (application.businessPayload as Record<string, unknown>) : {};
  const contactEmail = typeof payload.contactEmail === 'string' ? payload.contactEmail.toLowerCase() : null;
  if (contactEmail) {
    await sendEmail({
      to: [contactEmail],
      subject: `Perkzio: Application rejected (${application.referenceNumber})`,
      text: `Your merchant registration application has been rejected.\n\nReference: ${application.referenceNumber}\n\nIf you believe this is a mistake, please contact support.`,
    });
  }

  res.json({ ok: true, status: application.status });
}

