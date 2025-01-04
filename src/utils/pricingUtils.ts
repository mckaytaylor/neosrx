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
  if (!medication || !plan) {
    console.error('Missing medication or plan:', { medication, plan });
    return null;
  }

  const medicationPrices = MEDICATION_PRICES[medication.toLowerCase()];
  if (!medicationPrices) {
    console.error('Invalid medication:', medication);
    return null;
  }

  const amount = medicationPrices[plan];
  if (amount === undefined) {
    console.error('Invalid plan:', { medication, plan });
    return null;
  }

  console.log('Calculated amount:', { medication, plan, amount });
  return amount;
};