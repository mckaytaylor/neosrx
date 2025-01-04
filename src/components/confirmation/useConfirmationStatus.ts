import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Subscription {
  id: string;
  medication: string;
  plan_type: string;
  amount: number;
  status: string;
}

export const useConfirmationStatus = (subscription: Subscription) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateAssessmentStatus = async () => {
      if (!subscription?.id) {
        console.error("No assessment ID found");
        return;
      }

      try {
        console.log("Updating assessment status for ID:", subscription.id);
        
        // First verify current status
        const { data: currentAssessment, error: fetchError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", subscription.id)
          .single();

        if (fetchError || !currentAssessment) {
          console.error("Error fetching assessment:", fetchError);
          throw new Error("Assessment not found");
        }

        console.log("Current assessment status:", currentAssessment.status);

        // Force update to completed status
        const { error } = await supabase
          .from("assessments")
          .update({ status: "completed" })
          .eq("id", subscription.id);

        if (error) {
          console.error("Error updating assessment status:", error);
          throw error;
        }

        await queryClient.invalidateQueries({ queryKey: ["user-assessments"] });
        console.log("Successfully updated assessment status to completed");
        
        // Send confirmation email
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
              to: user.email,
              subscription,
            },
          });

          if (emailError) {
            console.error("Error sending confirmation email:", emailError);
            toast({
              title: "Error",
              description: "Failed to send confirmation email. Don't worry, your order is still confirmed!",
              variant: "destructive",
            });
          } else {
            console.log("Confirmation email sent successfully");
          }
        }

        toast({
          title: "Payment Successful",
          description: "Your order has been confirmed.",
        });
      } catch (error) {
        console.error("Error in updateAssessmentStatus:", error);
        toast({
          title: "Error",
          description: "Failed to update assessment status. Please contact support.",
          variant: "destructive",
        });
      }
    };

    if (subscription) {
      updateAssessmentStatus();
    }
  }, [subscription, toast, queryClient]);
};