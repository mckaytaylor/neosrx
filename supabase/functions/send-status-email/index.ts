import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailRequest {
  to: string
  status: "prescribed" | "denied"
  denialReason?: string
  medication: string
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, status, denialReason, medication }: EmailRequest = await req.json()
    
    if (!to || typeof to !== 'string') {
      console.error('Invalid email address provided:', to)
      throw new Error('Invalid email address provided')
    }
    
    const capitalizedMedication = medication.charAt(0).toUpperCase() + medication.slice(1)
    let subject, html

    if (status === "prescribed") {
      subject = `Your ${capitalizedMedication} Prescription Has Been Approved`
      html = `
        <h2>Prescription Approved</h2>
        <p>Great news! Your ${capitalizedMedication} prescription has been approved by our medical provider.</p>
        <p>Your medication will be shipped to your provided address shortly.</p>
        <p>You can track your order status in your dashboard.</p>
      `
    } else {
      const reason = denialReason || "No specific reason provided"
      subject = `Update Regarding Your ${capitalizedMedication} Prescription Request`
      html = `
        <h2>Prescription Update</h2>
        <p>We regret to inform you that our medical provider was unable to approve your ${capitalizedMedication} prescription request.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Your payment will be refunded to your original payment method within 3-5 business days.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      `
    }

    console.log('Sending email with subject:', subject)
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NEOS RX <no-reply@mybellehealth.com>",
        to: [to],
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error}`)
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Error in send-status-email function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
}

serve(handler)