import { PaymentData } from './types.ts';

export function validatePaymentData(paymentData: PaymentData): void {
  if (!paymentData?.cardNumber || !paymentData?.expirationDate || !paymentData?.cardCode) {
    throw new Error('Missing required payment information');
  }

  const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
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
    throw new Error('Invalid assessment amount');
  }
}