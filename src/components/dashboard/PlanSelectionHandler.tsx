import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

  const calculateAmount = (medication: string, plan: string): number | null => {
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

    if (!medication || !amounts[medication] || !amounts[medication][plan]) {
      console.error('Invalid amount calculation:', { medication, plan });
      return null;
    }

    const calculatedAmount = amounts[medication][plan];
    console.log('Calculated amount:', { medication, plan, amount: calculatedAmount });
    return calculatedAmount;
  };

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

      const medication = formData.selectedMedication?.toLowerCase();
      const selectedPlan = plan || '1 month';
      const amount = calculateAmount(medication, selectedPlan);
      
      if (!amount) {
        toast({
          title: "Error",
          description: "Invalid plan or medication selected",
          variant: "destructive",
        });
        return;
      }

      const medicalConditions = Array.isArray(formData.selectedConditions) 
        ? formData.selectedConditions 
        : [];

      const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
      const weight = parseFloat(formData.weight);

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();

      const assessmentData = {
        medication: medication,
        plan_type: selectedPlan,
        amount: amount,
        medical_conditions: medicalConditions,
        patient_height: isNaN(height) ? null : height,
        patient_weight: isNaN(weight) ? null : weight,
        status: 'draft' as const
      };

      console.log('Saving assessment with data:', assessmentData);

      let data;
      if (existingDraft) {
        // Update existing draft
        const { data: updatedData, error: updateError } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (updateError) throw updateError;
        data = updatedData;
      } else {
        // Create new draft with user_id
        const { data: newData, error: insertError } = await supabase
          .from('assessments')
          .insert({
            ...assessmentData,
            user_id: user.id
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      }

      if (!data) {
        throw new Error("Failed to save assessment");
      }

      console.log('Assessment saved successfully:', data);
      onSuccess(selectedPlan, data.id);
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