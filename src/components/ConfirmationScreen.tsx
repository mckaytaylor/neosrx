import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConfirmationScreenProps {
  subscription: {
    medication: string;
    plan_type: string;
    amount: number;
  };
}

export const ConfirmationScreen = ({ subscription }: ConfirmationScreenProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const capitalizedMedication = subscription?.medication?.charAt(0).toUpperCase() + subscription?.medication?.slice(1);

  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (subscription) {
        try {
          // Get the current user's email
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.email) {
            console.error("No user email found");
            return;
          }

          const { error } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              to: user.email,
              subscription,
            },
          });

          if (error) {
            console.error("Error sending confirmation email:", error);
            toast({
              title: "Error",
              description: "Failed to send confirmation email. Don't worry, your order is still confirmed!",
              variant: "destructive",
            });
          } else {
            console.log("Confirmation email sent successfully");
          }
        } catch (error) {
          console.error("Error in sendConfirmationEmail:", error);
        }
      }
    };

    if (subscription) {
      // Verify the assessment status is completed
      const verifyAssessmentStatus = async () => {
        try {
          const { data, error } = await supabase
            .from("assessments")
            .select("status")
            .eq("id", subscription.id)
            .single();

          if (error) {
            console.error("Error verifying assessment status:", error);
            return;
          }

          if (data.status !== "completed") {
            console.log("Updating assessment status to completed");
            await supabase
              .from("assessments")
              .update({ status: "completed" })
              .eq("id", subscription.id);
          }
        } catch (error) {
          console.error("Error in verifyAssessmentStatus:", error);
        }
      };

      verifyAssessmentStatus();
      sendConfirmationEmail();
      
      toast({
        title: "Payment Successful",
        description: "Your order has been confirmed.",
      });
    }
  }, [toast, subscription]);

  const handleReturnToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  if (!subscription) {
    return (
      <div className="text-center">
        <p className="text-red-500">Error loading order details. Please contact support if this persists.</p>
        <Button
          variant="link"
          onClick={handleReturnToDashboard}
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">
          Your {capitalizedMedication} is being reviewed by our provider
        </h2>
        <p className="text-muted-foreground">
          It should be on its way to you soon!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Medication:</span>
            <span className="font-medium">{capitalizedMedication}</span>
            
            <span className="text-muted-foreground">Plan:</span>
            <span className="font-medium">{subscription.plan_type}</span>
            
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">${subscription.amount}</span>
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <h4 className="font-medium">What's Next?</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Our medical provider will review your information within 24-48 hours</li>
              <li>Your credit card has been preauthorized, and the payment will finalize once you have been approved for the medication</li>
              <li>You'll receive an email confirmation once your prescription is approved</li>
              <li>Your medication will be shipped directly to your address</li>
              <li>Track your order status in your dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          variant="link"
          onClick={handleReturnToDashboard}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};