export interface PricingConfig {
  [key: string]: {
    [key: string]: number;
  };
}

export const PRICING_CONFIG: PricingConfig = {
  tirzepatide: {
    "1_month": 499,
    "3_months": 810,
    "5_months": 1300,
  },
  semaglutide: {
    "1_month": 399,
    "4_months": 640,
    "7_months": 1050,
  },
};

export const formatPlanType = (plan: string): string => {
  if (!plan || typeof plan !== 'string') {
    throw new Error('Invalid plan type');
  }
  return plan.toLowerCase().replace(/\s+/g, '_');
};

export const validatePlan = (plan: string, medication: string): void => {
  if (!plan || typeof plan !== 'string') {
    throw new Error('Invalid plan selection');
  }

  if (!medication || typeof medication !== 'string') {
    throw new Error('Please select a medication first');
  }

  const formattedPlan = formatPlanType(plan);
  const formattedMedication = medication.toLowerCase();

  if (!PRICING_CONFIG[formattedMedication]?.[formattedPlan]) {
    throw new Error('Invalid plan and medication combination');
  }
};

export const calculateAmount = (medication: string, plan: string): number => {
  const formattedPlan = formatPlanType(plan);
  const formattedMedication = medication.toLowerCase();

  const amount = PRICING_CONFIG[formattedMedication]?.[formattedPlan];
  if (!amount) {
    throw new Error('Invalid plan or medication selected');
  }

  return amount;
};