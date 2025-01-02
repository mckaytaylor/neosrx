import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePaymentSuccess = ({ formData, onSuccess }: { formData: any, onSuccess: (assessment: any) => void }) => {
  const { toast } = useToast();
  
  const handlePaymentSuccess = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("assessments")
        .update({ status: "completed" })
        .eq("id", assessmentId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Payment successful",
        description: "Your assessment has been submitted for review.",
      });

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
  const assessmentId = searchParams.get("assessment_id");

  useEffect(() => {
    const updateAssessmentStatus = async () => {
      if (!assessmentId) return;

      try {
        const { error } = await supabase
          .from("assessments")
          .update({ status: "completed" })
          .eq("id", assessmentId);

        if (error) throw error;

        toast({
          title: "Payment successful",
          description: "Your assessment has been submitted for review.",
        });

        navigate("/dashboard");
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
  }, [assessmentId, navigate, toast]);

  return null;
};