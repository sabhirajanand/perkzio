import nodemailer from 'nodemailer';

import { loadEnv } from '../../config/env.js';

export interface SendEmailInput {
  to: string[];
  subject: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: true } | { ok: false; reason: string }> {
  const env = loadEnv();
  const to = input.to.filter(Boolean);
  if (to.length === 0) return { ok: false, reason: 'No recipients' };

  const host = env.SMTP_HOST;
  const from = env.SMTP_FROM;
  if (!host || !from) {
    // Dev-safe fallback: do not fail flows if SMTP is not configured.
    console.log('[email:disabled]', { to, subject: input.subject, text: input.text });
    return { ok: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from,
    to,
    subject: input.subject,
    text: input.text,
  });

  return { ok: true };
}

