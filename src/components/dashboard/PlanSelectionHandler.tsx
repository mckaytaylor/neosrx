import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAssessmentManagement } from "@/hooks/useAssessmentManagement";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();
  const { saveAssessment } = useAssessmentManagement();

  const handlePlanSelect = async (plan: string) => {
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

      const assessment = await saveAssessment(user.id, formData, plan);
      
      if (assessment) {
        console.log('Plan selected successfully:', { plan, assessmentId: assessment.id });
        onSuccess(plan, assessment.id);
      }
    } catch (error: any) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handlePlanSelect };
};