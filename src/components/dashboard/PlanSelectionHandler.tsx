import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

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

      const amounts: Record<string, Record<string, number>> = {
        tirzepatide: {
          "1 month": 499,
          "3 months": 810,
          "5 months": 1300,
        },
        semaglutide: {
          "1 month": 399,
          "4 months": 640,
          "7 months": 1050,
        },
      };

      const medication = formData.selectedMedication?.toLowerCase();
      if (!medication || !amounts[medication]) {
        toast({
          title: "Error",
          description: "Invalid medication selected",
          variant: "destructive",
        });
        return;
      }

      const amount = amounts[medication][plan];
      if (amount === undefined) {
        toast({
          title: "Error",
          description: "Invalid plan selected",
          variant: "destructive",
        });
        return;
      }

      const medicalConditions = Array.isArray(formData.selectedConditions) 
        ? formData.selectedConditions 
        : [];

      const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
      const weight = parseInt(formData.weight);

      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          medication: medication,
          plan_type: plan,
          amount: amount,
          medical_conditions: medicalConditions,
          patient_height: height || null,
          patient_weight: weight || null,
          status: 'pending'
        });

      if (error) {
        console.error("Error selecting plan:", error);
        throw error;
      }

      onSuccess(plan);
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