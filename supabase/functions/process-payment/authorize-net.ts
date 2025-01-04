import { PaymentData, Assessment, AuthorizeNetResponse } from './types.ts';

export async function processAuthorizeNetPayment(
  paymentData: PaymentData,
  assessment: Assessment,
  authLoginId: string,
  transactionKey: string
): Promise<AuthorizeNetResponse> {
  console.log('Processing payment with Authorize.net:', {
    assessmentId: assessment.id,
    amount: assessment.amount,
    medication: assessment.medication,
    plan: assessment.plan_type
  });

  const expDate = paymentData.expirationDate.replace(/\D/g, '');
  const shortRefId = assessment.id.substring(0, 20);
  const cardNumber = paymentData.cardNumber.replace(/\s/g, '');

  // Log test card usage but still process through sandbox
  if (Deno.env.get('ENVIRONMENT') === 'development' && cardNumber === '4111111111111111') {
    console.log('Using test card in development - processing through Authorize.net sandbox');
  }

  const paymentRequest = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: authLoginId,
        transactionKey: transactionKey
      },
      refId: shortRefId,
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: assessment.amount.toString(),
        payment: {
          creditCard: {
            cardNumber: cardNumber,
            expirationDate: expDate,
            cardCode: paymentData.cardCode
          }
        },
        order: {
          invoiceNumber: shortRefId,
          description: `${assessment.medication} - ${assessment.plan_type}`
        },
        billTo: {
          firstName: "Test",
          lastName: "Customer",
          address: assessment.shipping_address || "123 Test St",
          city: assessment.shipping_city || "Test City",
          state: assessment.shipping_state || "CA",
          zip: assessment.shipping_zip || "12345",
          country: "US"
        }
      }
    }
  };

  console.log('Sending payment request to Authorize.net');
  
  const response = await fetch('https://apitest.authorize.net/xml/v1/request.api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentRequest)
  });

  const paymentResponse = await response.json();
  
  console.log('Payment response received:', {
    resultCode: paymentResponse.messages?.resultCode,
    responseCode: paymentResponse.transactionResponse?.responseCode,
    errors: paymentResponse.transactionResponse?.errors || paymentResponse.messages?.message
  });

  return paymentResponse;
}

export function validatePaymentResponse(response: AuthorizeNetResponse): void {
  if (!response.messages || !response.transactionResponse) {
    console.error('Invalid payment response structure:', response);
    throw new Error('Invalid payment response from processor');
  }

  if (response.messages.resultCode !== "Ok") {
    const errorMessage = response.messages?.message?.[0]?.text || 
                        response.transactionResponse?.errors?.[0]?.errorText ||
                        'Payment processing failed';
    console.error('Payment error details:', errorMessage);
    throw new Error(errorMessage);
  }

  if (!response.transactionResponse?.responseCode || 
      response.transactionResponse.responseCode !== "1") {
    const errorMessage = response.transactionResponse?.messages?.[0]?.description || 
                        response.transactionResponse?.errors?.[0]?.errorText ||
                        'Transaction was not approved';
    console.error(`Payment failed: ${errorMessage}`);
    throw new Error(errorMessage);
  }
}