import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { ApiContracts, ApiControllers } from "https://esm.sh/authorizenet@2.0.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Parse request body
    const { paymentData, subscriptionId } = await req.json()
    if (!paymentData || !subscriptionId) {
      throw new Error('Missing required payment data')
    }

    console.log('Processing payment for subscription:', subscriptionId)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get subscription details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (subscriptionError || !subscription) {
      throw new Error('Subscription not found')
    }

    // Set up payment request
    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType()
    merchantAuthenticationType.setName(Deno.env.get('AUTHORIZENET_API_LOGIN_ID'))
    merchantAuthenticationType.setTransactionKey(Deno.env.get('AUTHORIZENET_TRANSACTION_KEY'))

    const creditCard = new ApiContracts.CreditCardType()
    creditCard.setCardNumber(paymentData.cardNumber)
    creditCard.setExpirationDate(paymentData.expirationDate)
    creditCard.setCardCode(paymentData.cardCode)

    const paymentType = new ApiContracts.PaymentType()
    paymentType.setCreditCard(creditCard)

    const transactionRequestType = new ApiContracts.TransactionRequestType()
    transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION)
    transactionRequestType.setPayment(paymentType)
    transactionRequestType.setAmount(subscription.amount)

    const createRequest = new ApiContracts.CreateTransactionRequest()
    createRequest.setMerchantAuthentication(merchantAuthenticationType)
    createRequest.setTransactionRequest(transactionRequestType)

    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON())

    // Process payment
    const response = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse()
        const response = new ApiContracts.CreateTransactionResponse(apiResponse)
        
        if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          resolve(response)
        } else {
          const error = response.getMessages().getMessage()[0]
          reject(new Error(`${error.getCode()}: ${error.getText()}`))
        }
      })
    })

    // Update subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId)

    if (updateError) {
      throw new Error('Failed to update subscription status')
    }

    console.log('Payment processed successfully for subscription:', subscriptionId)

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Payment processing error:', error.message)
    
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: error.message 
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})