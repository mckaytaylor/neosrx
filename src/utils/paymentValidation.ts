export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Special handling for test card
  if (cleanNumber === '4111111111111111') {
    console.log('Test card detected - validation passed');
    return true;
  }
  
  // Regular validation for non-test cards
  const isValid = /^\d{15,16}$/.test(cleanNumber);
  console.log('Card validation result:', { isValid, length: cleanNumber.length });
  return isValid;
};

export const validateExpirationDate = (expDate: string): boolean => {
  const [month, year] = expDate.split('/');
  if (!month || !year) {
    console.log('Invalid expiration date format');
    return false;
  }

  const currentDate = new Date();
  const expiration = new Date(parseInt(`20${year}`), parseInt(month) - 1);
  const isValid = expiration > currentDate;
  console.log('Expiration validation result:', { isValid, expDate });
  return isValid;
};

export const validateCardCode = (code: string): boolean => {
  const isValid = /^\d{3,4}$/.test(code);
  console.log('CVV validation result:', { isValid, length: code.length });
  return isValid;
};

export const getErrorMessage = (error: any): string => {
  console.log('Payment error details:', error);
  
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