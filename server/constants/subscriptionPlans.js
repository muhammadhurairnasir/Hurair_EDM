export const PLANS = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium'
};

export const PLAN_FEATURES = {
  [PLANS.BASIC]: ['menu', 'orders'],
  [PLANS.STANDARD]: ['menu', 'orders', 'tables', 'staff'],
  [PLANS.PREMIUM]: ['menu', 'orders', 'tables', 'staff', 'dashboard', 'analytics']
};
