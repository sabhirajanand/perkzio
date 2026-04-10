import type { Request, Response } from 'express';
import crypto from 'crypto';
import { loadEnv } from '../../../config/env.js';
import { getDataSource } from '../../../config/database.js';
import { MerchantOnboardingApplication } from '../../../entities/MerchantOnboardingApplication.js';

function timingSafeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

export async function handleRazorpayWebhook(req: Request, res: Response): Promise<void> {
  const env = loadEnv();
  const signature = req.header('x-razorpay-signature') ?? '';
  const secret = env.RAZORPAY_WEBHOOK_SECRET ?? '';
  if (!secret) {
    res.status(500).json({ ok: false });
    return;
  }

  const raw = req.body as Buffer;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!signature || !timingSafeEqualHex(expected, signature)) {
    res.status(401).json({ ok: false });
    return;
  }

  let payload: unknown = null;
  try {
    payload = JSON.parse(raw.toString('utf8')) as unknown;
  } catch {
    res.status(400).json({ ok: false });
    return;
  }

  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === 'object' ? (v as Record<string, unknown>) : null;

  const getNestedString = (root: unknown, path: string[]): string | undefined => {
    let cur: unknown = root;
    for (const key of path) {
      const r = asRecord(cur);
      if (!r) return undefined;
      cur = r[key];
    }
    return typeof cur === 'string' ? cur : undefined;
  };

  const event = getNestedString(payload, ['event']);

  const orderId: string | undefined =
    getNestedString(payload, ['payload', 'order', 'entity', 'id']) ??
    getNestedString(payload, ['payload', 'payment', 'entity', 'order_id']) ??
    getNestedString(payload, ['payload', 'invoice', 'entity', 'order_id']);

  if (orderId && (event === 'order.paid' || event === 'payment.captured')) {
    const repo = getDataSource().getRepository(MerchantOnboardingApplication);
    const application = await repo.findOne({ where: { razorpayOrderId: orderId } });
    if (application && application.status === 'PAYMENT_PENDING') {
      application.status = 'SUBMITTED';
      await repo.save(application);
    }
  }

  res.json({ ok: true });
}

