export const getPlanAmount = (medication: string, planType: string): number => {
  const plans = {
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

  return plans[medication.toLowerCase()]?.[planType.toLowerCase()] || 0;
};