export interface PaymentData {
  cardNumber: string;
  expirationDate: string;
  cardCode: string;
}

export interface Assessment {
  id: string;
  amount: number;
  medication: string;
  plan_type: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
}

export interface AuthorizeNetResponse {
  messages?: {
    resultCode: string;
    message?: { text: string }[];
  };
  transactionResponse?: {
    responseCode?: string;
    authCode?: string;
    transId?: string;
    messages?: { description: string }[];
    errors?: { errorText: string }[];
  };
}