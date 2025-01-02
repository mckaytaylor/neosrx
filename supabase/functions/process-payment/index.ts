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

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (assessmentError || !assessment) {
      console.error('Assessment not found:', assessmentError)
      throw new Error('Assessment not found')
    }

    // Get Authorize.net credentials
    const authLoginId = Deno.env.get('AUTHORIZENET_API_LOGIN_ID')
    const transactionKey = Deno.env.get('AUTHORIZENET_TRANSACTION_KEY')
    const signatureKey = Deno.env.get('AUTHORIZENET_SIGNATURE_KEY')

    if (!authLoginId || !transactionKey || !signatureKey) {
      throw new Error('Missing Authorize.net credentials')
    }

    console.log('Using Authorize.net sandbox endpoint')
    const authNetEndpoint = 'https://apitest.authorize.net/xml/v1/request.api'

    // Create authentication signature
    const timestamp = Math.floor(Date.now() / 1000)
    const signatureString = `${authLoginId}^${paymentData.cardNumber}^${timestamp}^${assessment.amount}`
    const encoder = new TextEncoder()
    const data = encoder.encode(signatureString)
    const key = encoder.encode(signatureKey)
    const hmacDigest = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    ).then(key => crypto.subtle.sign(
      "HMAC",
      key,
      data
    ));
    const signature = Array.from(new Uint8Array(hmacDigest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const paymentRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: authLoginId,
          transactionKey: transactionKey
        },
        refId: subscriptionId,
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: assessment.amount,
          payment: {
            creditCard: {
              cardNumber: paymentData.cardNumber,
              expirationDate: paymentData.expirationDate,
              cardCode: paymentData.cardCode
            }
          },
          retail: {
            marketType: 2,
            deviceType: 1
          },
          customerIP: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          userFields: {
            userField: [
              {
                name: "x_signature",
                value: signature
              },
              {
                name: "x_timestamp",
                value: timestamp.toString()
              }
            ]
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
    console.log('Payment response:', paymentResponse)

    if (!response.ok || 
        paymentResponse.messages?.resultCode !== "Ok" || 
        paymentResponse.transactionResponse?.responseCode !== "1") {
      console.error('Payment failed:', paymentResponse)
      throw new Error(paymentResponse.messages?.message?.[0]?.text || 'Payment processing failed')
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