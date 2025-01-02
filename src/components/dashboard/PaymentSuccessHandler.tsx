import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentSuccessHandlerProps {
  formData: any;
  onSuccess: (assessment: any) => void;
}

export const usePaymentSuccess = ({ formData, onSuccess }: PaymentSuccessHandlerProps) => {
  const { toast } = useToast();

  const handlePaymentSuccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const { data: assessment, error } = await supabase
        .from('assessments')
        .update({ status: "needs_review" })
        .eq('id', formData.assessmentId)
        .select()
        .single();

      if (error) throw error;

      onSuccess(assessment);
    } catch (error: any) {
      console.error("Error handling payment success:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update assessment status",
        variant: "destructive",
      });
    }
  };

  return { handlePaymentSuccess };
};