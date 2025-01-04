import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

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
    // Parse request body
    const { paymentData, subscriptionId } = await req.json()
    
    console.log('Processing payment request:', { 
      subscriptionId,
      cardNumberLength: paymentData?.cardNumber?.length,
      hasExpDate: !!paymentData?.expirationDate,
      hasCardCode: !!paymentData?.cardCode
    })
    
    // Validate required fields
    if (!paymentData?.cardNumber || !paymentData?.expirationDate || !paymentData?.cardCode) {
      console.error('Missing required payment fields:', { 
        hasCardNumber: !!paymentData?.cardNumber,
        hasExpDate: !!paymentData?.expirationDate,
        hasCardCode: !!paymentData?.cardCode
      })
      throw new Error('Missing required payment information')
    }

    if (!subscriptionId) {
      console.error('Missing subscription ID')
      throw new Error('Missing subscription ID')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration')
      throw new Error('Server configuration error')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (assessmentError || !assessment) {
      console.error('Assessment fetch error:', assessmentError)
      throw new Error('Assessment not found')
    }

    console.log('Found assessment:', { 
      id: assessment.id, 
      amount: assessment.amount,
      medication: assessment.medication,
      plan_type: assessment.plan_type
    })

    // Get Authorize.net credentials
    const authLoginId = Deno.env.get('AUTHORIZENET_API_LOGIN_ID')
    const transactionKey = Deno.env.get('AUTHORIZENET_TRANSACTION_KEY')
    
    if (!authLoginId || !transactionKey) {
      console.error('Missing Authorize.net credentials')
      throw new Error('Payment processor configuration error')
    }

    // Format card data
    const expDate = paymentData.expirationDate.replace(/\D/g, '')
    const shortRefId = subscriptionId.substring(0, 20)
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '')

    // Validate card data format
    if (cardNumber.length < 15 || cardNumber.length > 16) {
      throw new Error('Invalid card number format')
    }

    if (expDate.length !== 4) {
      throw new Error('Invalid expiration date format')
    }

    if (paymentData.cardCode.length < 3 || paymentData.cardCode.length > 4) {
      throw new Error('Invalid card security code')
    }

    console.log('Preparing payment request for amount:', assessment.amount)

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
    }

    console.log('Sending payment request to Authorize.net')
    
    const response = await fetch('https://apitest.authorize.net/xml/v1/request.api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    })

    const paymentResponse = await response.json()
    console.log('Payment response received:', {
      resultCode: paymentResponse.messages?.resultCode,
      responseCode: paymentResponse.transactionResponse?.responseCode,
      errors: paymentResponse.transactionResponse?.errors || paymentResponse.messages?.message
    })

    // Check for specific error conditions
    if (paymentResponse.messages?.resultCode !== "Ok") {
      const errorMessage = paymentResponse.messages?.message?.[0]?.text || 
                          paymentResponse.transactionResponse?.errors?.[0]?.errorText ||
                          'Payment processing failed'
      console.error('Payment error details:', errorMessage)
      throw new Error(errorMessage)
    }

    // Verify transaction success
    if (!paymentResponse.transactionResponse?.responseCode || 
        paymentResponse.transactionResponse.responseCode !== "1") {
      const errorCode = paymentResponse.transactionResponse?.responseCode
      const errorMessage = paymentResponse.transactionResponse?.messages?.[0]?.description || 
                          paymentResponse.transactionResponse?.errors?.[0]?.errorText ||
                          'Transaction was not approved'
      console.error(`Payment failed with code ${errorCode}: ${errorMessage}`)
      throw new Error(errorMessage)
    }

    // Update assessment status
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ status: 'completed' })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Failed to update assessment status:', updateError)
      throw new Error('Failed to update assessment status')
    }

    console.log('Payment processed successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        transactionId: paymentResponse.transactionResponse?.transId
      }),
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
        message: error.message || 'The transaction was unsuccessful.'
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