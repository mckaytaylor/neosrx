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

    // Process payment using fetch instead of the Authorize.net SDK
    const authLoginId = Deno.env.get('AUTHORIZENET_API_LOGIN_ID')
    const transactionKey = Deno.env.get('AUTHORIZENET_TRANSACTION_KEY')

    if (!authLoginId || !transactionKey) {
      throw new Error('Missing Authorize.net credentials')
    }

    // Use sandbox endpoint
    const authNetEndpoint = 'https://apitest.authorize.net/xml/v1/request.api'

    const paymentRequest = {
      createTransactionRequest: {
        merchantAuthentication: {
          name: authLoginId,
          transactionKey: transactionKey
        },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: assessment.amount,
          payment: {
            creditCard: {
              cardNumber: paymentData.cardNumber,
              expirationDate: paymentData.expirationDate,
              cardCode: paymentData.cardCode
            }
          }
        }
      }
    }

    const response = await fetch(authNetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    })

    const paymentResponse = await response.json()
    console.log('Payment response:', paymentResponse)

    if (!response.ok) {
      throw new Error('Payment processing failed')
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