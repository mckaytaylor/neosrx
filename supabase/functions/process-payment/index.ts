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
    if (!paymentData || !subscriptionId) {
      throw new Error('Missing required payment data')
    }

    console.log('Processing payment for assessment:', subscriptionId)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get assessment details including shipping information
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, profiles(first_name, last_name)')
      .eq('id', subscriptionId)
      .single()

    if (assessmentError || !assessment) {
      console.error('Assessment not found:', assessmentError)
      throw new Error('Assessment not found')
    }

    // Get Authorize.net credentials
    const authLoginId = Deno.env.get('AUTHORIZENET_API_LOGIN_ID')
    const transactionKey = Deno.env.get('AUTHORIZENET_TRANSACTION_KEY')
    if (!authLoginId || !transactionKey) {
      throw new Error('Missing Authorize.net credentials')
    }

    console.log('Using Authorize.net sandbox endpoint')
    const authNetEndpoint = 'https://apitest.authorize.net/xml/v1/request.api'

    // Format expiration date (remove any non-digit characters and ensure MMYYYY format)
    const expDate = paymentData.expirationDate.replace(/\D/g, '')
    
    // Generate a shorter reference ID (first 20 chars of UUID should be unique enough)
    const shortRefId = subscriptionId.substring(0, 20)

    // Format card number (remove spaces)
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '')

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
          tax: {
            amount: "0.00",
            name: "No Tax",
            description: "No Tax Applied"
          },
          billTo: {
            firstName: assessment.profiles?.first_name || "Not",
            lastName: assessment.profiles?.last_name || "Provided",
            address: assessment.shipping_address,
            city: assessment.shipping_city,
            state: assessment.shipping_state,
            zip: assessment.shipping_zip,
            country: "US"
          },
          shipTo: {
            firstName: assessment.profiles?.first_name || "Not",
            lastName: assessment.profiles?.last_name || "Provided",
            address: assessment.shipping_address,
            city: assessment.shipping_city,
            state: assessment.shipping_state,
            zip: assessment.shipping_zip,
            country: "US"
          }
        }
      }
    }

    console.log('Sending payment request to Authorize.net sandbox')
    const response = await fetch(authNetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    })

    const paymentResponse = await response.json()
    console.log('Payment response:', JSON.stringify(paymentResponse))

    // Check for specific error conditions in the response
    if (paymentResponse.messages?.resultCode !== "Ok") {
      const errorMessage = paymentResponse.messages?.message?.[0]?.text || 'Payment processing failed'
      console.error('Payment error details:', errorMessage)
      throw new Error(errorMessage)
    }

    // Verify transaction success
    if (!paymentResponse.transactionResponse?.responseCode || 
        paymentResponse.transactionResponse.responseCode !== "1") {
      const errorCode = paymentResponse.transactionResponse?.responseCode
      const errorMessage = paymentResponse.transactionResponse?.messages?.[0]?.description || 
                          'Transaction was not approved'
      console.error(`Payment failed with code ${errorCode}: ${errorMessage}`)
      throw new Error(errorMessage)
    }

    // Update assessment status
    const { error: updateError } = await supabase
      .from('assessments')
      .update({ status: 'active' })
      .eq('id', subscriptionId)

    if (updateError) {
      throw new Error('Failed to update assessment status')
    }

    console.log('Payment processed successfully for assessment:', subscriptionId)

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