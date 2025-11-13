
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',

  plans: {
    mini: {
      name: 'Mini',
      monthlyPrice: 0,
      yearlyPrice: 0,
      monthlyPriceId: '',
      yearlyPriceId: '',
    },
    odbornik: {
      name: 'Odborník',
      monthlyPrice: 9.90,
      yearlyPrice: 99.00,
      monthlyPriceId: import.meta.env.VITE_STRIPE_ODBORNIK_MONTHLY_PRICE_ID || '',
      yearlyPriceId: import.meta.env.VITE_STRIPE_ODBORNIK_YEARLY_PRICE_ID || '',
    },
    expert: {
      name: 'Expert',
      monthlyPrice: 19.90,
      yearlyPrice: 195.00,
      monthlyPriceId: import.meta.env.VITE_STRIPE_EXPERT_MONTHLY_PRICE_ID || '',
      yearlyPriceId: import.meta.env.VITE_STRIPE_EXPERT_YEARLY_PRICE_ID || '',
    },
    profik: {
      name: 'Profik',
      monthlyPrice: 25.50,
      yearlyPrice: 225.00,
      monthlyPriceId: import.meta.env.VITE_STRIPE_PROFIK_MONTHLY_PRICE_ID || '',
      yearlyPriceId: import.meta.env.VITE_STRIPE_PROFIK_YEARLY_PRICE_ID || '',
    },
    premier: {
      name: 'Premier',
      monthlyPrice: 4979.00,
      yearlyPrice: 4979.00,
      monthlyPriceId: import.meta.env.VITE_STRIPE_PREMIER_PRICE_ID || '',
      yearlyPriceId: import.meta.env.VITE_STRIPE_PREMIER_PRICE_ID || '',
    },
  },
};

export function getPlanPrice(planKey: keyof typeof STRIPE_CONFIG.plans, period: 'monthly' | 'yearly'): number {
  const plan = STRIPE_CONFIG.plans[planKey];
  return period === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
}

export function getPlanPriceId(planKey: keyof typeof STRIPE_CONFIG.plans, period: 'monthly' | 'yearly'): string {
  const plan = STRIPE_CONFIG.plans[planKey];
  return period === 'monthly' ? plan.monthlyPriceId : plan.yearlyPriceId;
}
