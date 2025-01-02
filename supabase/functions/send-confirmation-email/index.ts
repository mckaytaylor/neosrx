import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subscription: {
    medication: string;
    plan_type: string;
    amount: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subscription }: EmailRequest = await req.json();
    console.log("Sending confirmation email to:", to);
    
    const capitalizedMedication = subscription.medication.charAt(0).toUpperCase() + subscription.medication.slice(1);
    
    const emailHtml = `
      <h2>Your ${capitalizedMedication} Order Confirmation</h2>
      <p>Thank you for your order! Our medical provider will review your information within 24-48 hours.</p>
      
      <h3>Order Summary:</h3>
      <ul>
        <li>Medication: ${capitalizedMedication}</li>
        <li>Plan: ${subscription.plan_type}</li>
        <li>Total Amount: $${subscription.amount}</li>
      </ul>
      
      <h3>What's Next?</h3>
      <ul>
        <li>Our medical provider will review your information within 24-48 hours</li>
        <li>Your credit card has been preauthorized, and the payment will finalize once you have been approved for the medication</li>
        <li>You'll receive another email confirmation once your prescription is approved</li>
        <li>Your medication will be shipped directly to your address</li>
        <li>You can track your order status in your dashboard</li>
      </ul>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NEOS RX <no-reply@mybellehealth.com>",
        to: [to],
        subject: `Your ${capitalizedMedication} Order Confirmation`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);