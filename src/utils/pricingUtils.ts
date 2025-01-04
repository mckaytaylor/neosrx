type MedicationPricing = {
  [key: string]: {
    [key: string]: number;
  };
};

export const MEDICATION_PRICES: MedicationPricing = {
  tirzepatide: {
    "1 month": 499,
    "3 months": 810,
    "5 months": 1300,
  },
  semaglutide: {
    "1 month": 399,
    "4 months": 640,
    "7 months": 1050,
  },
};

export const calculateAmount = (medication: string, plan: string): number | null => {
  if (!medication || !MEDICATION_PRICES[medication] || !MEDICATION_PRICES[medication][plan]) {
    console.error('Invalid amount calculation:', { medication, plan });
    return null;
  }

  const amount = MEDICATION_PRICES[medication][plan];
  console.log('Calculated amount:', { medication, plan, amount });
  return amount;
};