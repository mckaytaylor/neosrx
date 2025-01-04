import { PaymentData } from './types.ts';

export function validatePaymentData(paymentData: PaymentData): void {
  if (!paymentData?.cardNumber || !paymentData?.expirationDate || !paymentData?.cardCode) {
    throw new Error('Missing required payment information');
  }

  const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
  
  // Special handling for test card in development
  if (Deno.env.get('ENVIRONMENT') === 'development' && cardNumber === '4111111111111111') {
    console.log('Validating test card in development environment');
    return;
  }

  if (cardNumber.length < 15 || cardNumber.length > 16) {
    throw new Error('Invalid card number format');
  }

  const expDate = paymentData.expirationDate.replace(/\D/g, '');
  if (expDate.length !== 4) {
    throw new Error('Invalid expiration date format');
  }

  if (paymentData.cardCode.length < 3 || paymentData.cardCode.length > 4) {
    throw new Error('Invalid card security code');
  }
}

export function validateAssessment(assessment: any): void {
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  if (!assessment.amount || assessment.amount <= 0) {
    console.error('Invalid assessment amount:', assessment);
    throw new Error('Invalid assessment amount');
  }

  console.log('Assessment validation passed:', {
    id: assessment.id,
    amount: assessment.amount,
    plan: assessment.plan_type,
    medication: assessment.medication
  });
}