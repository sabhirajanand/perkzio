declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export async function ensureRazorpayLoaded(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay="checkout"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Unable to load payments')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'checkout';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load payments'));
    document.body.appendChild(script);
  });
}

