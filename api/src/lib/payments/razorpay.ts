import Razorpay from 'razorpay';
import { loadEnv } from '../../config/env.js';

export function getRazorpayClient(): Razorpay {
  const env = loadEnv();
  if (!env.RAZORPAY_KEY_ID) throw new Error('RAZORPAY_KEY_ID is not set');
  if (!env.RAZORPAY_KEY_SECRET) throw new Error('RAZORPAY_KEY_SECRET is not set');
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
}

export function getRazorpayKeyId(): string {
  const env = loadEnv();
  if (!env.RAZORPAY_KEY_ID) throw new Error('RAZORPAY_KEY_ID is not set');
  return env.RAZORPAY_KEY_ID;
}

