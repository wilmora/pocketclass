// ============================================
// POCKETCLASS — Pricing & Commission Engine
// ============================================

export const PRICING = {
  VIDEO_PRICE: 2.00,
  SESSION_PRICE: 3.00,
  PLATFORM_COMMISSION: 0.15,
  CURRENCY: 'usd',
} as const;

export function calculateCommission(amount: number) {
  const platformFee = Math.round(amount * PRICING.PLATFORM_COMMISSION * 100) / 100;
  const instructorAmount = Math.round((amount - platformFee) * 100) / 100;
  return { platformFee, instructorAmount };
}

export function calculateVideosPurchase(videoCount: number) {
  const total = videoCount * PRICING.VIDEO_PRICE;
  const { platformFee, instructorAmount } = calculateCommission(total);
  return { total, platformFee, instructorAmount, videoCount };
}

export function calculateSessionPurchase() {
  const total = PRICING.SESSION_PRICE;
  const { platformFee, instructorAmount } = calculateCommission(total);
  return { total, platformFee, instructorAmount };
}

export function formatPrice(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
