export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Special handling for test card
  if (cleanNumber === '4111111111111111') {
    return true;
  }
  
  return /^\d{15,16}$/.test(cleanNumber);
};

export const validateExpirationDate = (expDate: string): boolean => {
  const [month, year] = expDate.split('/');
  if (!month || !year) return false;

  const currentDate = new Date();
  const expiration = new Date(parseInt(`20${year}`), parseInt(month) - 1);
  return expiration > currentDate;
};

export const validateCardCode = (code: string): boolean => {
  return /^\d{3,4}$/.test(code);
};

export const getErrorMessage = (error: any): string => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('card number format')) {
    return 'Please enter a valid card number (15-16 digits).';
  }
  if (errorMessage.includes('expired')) {
    return 'This card has expired. Please use a different card.';
  }
  if (errorMessage.includes('declined')) {
    return 'Your card was declined. Please check your card details or try a different card.';
  }
  if (errorMessage.includes('invalid')) {
    return 'The card information provided is invalid. Please check and try again.';
  }
  if (errorMessage.includes('cvv') || errorMessage.includes('security code')) {
    return 'Invalid security code (CVV). Please check and try again.';
  }
  
  return 'There was a problem processing your payment. Please try again.';
};