import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const usePaymentSuccess = ({ formData, onSuccess }: { formData: any, onSuccess: (assessment: any) => void }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handlePaymentSuccess = async (assessmentId: string) => {
    try {
      console.log('Updating assessment status for ID:', assessmentId);
      
      const { data, error } = await supabase
        .from("assessments")
        .update({ status: "completed" })
        .eq("id", assessmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating assessment:', error);
        throw error;
      }

      console.log('Successfully updated assessment:', data);

      toast({
        title: "Payment successful",
        description: "Your assessment has been submitted for review.",
      });

      await queryClient.invalidateQueries({ queryKey: ["user-assessments"] });

      if (data) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Error updating assessment status:", error);
      toast({
        title: "Error",
        description: "Failed to update assessment status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return { handlePaymentSuccess };
};

export const PaymentSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const assessmentId = searchParams.get("assessment_id");

  useEffect(() => {
    const updateAssessmentStatus = async () => {
      if (!assessmentId) {
        console.log('No assessment ID found in URL parameters');
        return;
      }

      try {
        console.log('Updating assessment status for ID:', assessmentId);
        
        const { data, error } = await supabase
          .from("assessments")
          .update({ status: "completed" })
          .eq("id", assessmentId)
          .select()
          .single();

        if (error) {
          console.error('Error updating assessment:', error);
          throw error;
        }

        console.log('Successfully updated assessment:', data);

        await queryClient.invalidateQueries({ queryKey: ["user-assessments"] });

        toast({
          title: "Payment successful",
          description: "Your assessment has been submitted for review.",
        });

        navigate("/dashboard", { 
          replace: true,
          state: { 
            showCompletedOrder: true,
            subscription: data 
          }
        });
      } catch (error) {
        console.error("Error updating assessment status:", error);
        toast({
          title: "Error",
          description: "Failed to update assessment status. Please contact support.",
          variant: "destructive",
        });
      }
    };

    updateAssessmentStatus();
  }, [assessmentId, navigate, toast, queryClient]);

  return null;
};