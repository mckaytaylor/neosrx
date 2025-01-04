import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"
import { validatePaymentData, validateAssessment } from "./validation.ts"
import { processAuthorizeNetPayment, validatePaymentResponse } from "./authorize-net.ts"
import { PaymentData, Assessment } from "./types.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { paymentData, subscriptionId } = await req.json()
    
    console.log('Processing payment request:', { 
      subscriptionId,
      cardNumberLength: paymentData?.cardNumber?.length,
      hasExpDate: !!paymentData?.expirationDate,
      hasCardCode: !!paymentData?.cardCode
    })

    // Validate payment data
    validatePaymentData(paymentData as PaymentData)

    if (!subscriptionId) {
      throw new Error('Missing subscription ID')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Server configuration error')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (assessmentError) {
      console.error('Assessment fetch error:', assessmentError)
      throw new Error('Assessment not found')
    }

    validateAssessment(assessment)

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
      throw new Error('Payment processor configuration error')
    }

    // Process payment
    const paymentResponse = await processAuthorizeNetPayment(
      paymentData as PaymentData,
      assessment as Assessment,
      authLoginId,
      transactionKey
    )

    // Validate payment response
    validatePaymentResponse(paymentResponse)

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