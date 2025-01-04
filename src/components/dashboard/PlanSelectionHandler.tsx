import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

interface PricingConfig {
  [key: string]: {
    [key: string]: number;
  };
}

const PRICING_CONFIG: PricingConfig = {
  tirzepatide: {
    "1_month": 499,
    "3_months": 810,
    "5_months": 1300,
  },
  semaglutide: {
    "1_month": 399,
    "4_months": 640,
    "7_months": 1050,
  },
};

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

  const formatPlanType = (plan: string): string => {
    return plan.toLowerCase().replace(/\s+/g, '_');
  };

  const calculateAmount = (medication: string, formattedPlan: string): number | null => {
    if (!medication || !PRICING_CONFIG[medication] || !PRICING_CONFIG[medication][formattedPlan]) {
      console.error('Invalid amount calculation:', { medication, formattedPlan });
      return null;
    }

    const amount = PRICING_CONFIG[medication][formattedPlan];
    console.log('Calculated amount:', { medication, plan: formattedPlan, amount });
    return amount;
  };

  const validatePlanSelection = (plan: string, medication: string) => {
    if (!plan || typeof plan !== 'string' || plan.trim() === '') {
      throw new Error('Invalid plan selection');
    }

    if (!medication) {
      throw new Error('Please select a medication first');
    }
  };

  const prepareAssessmentData = (
    userId: string,
    medication: string,
    formattedPlan: string,
    amount: number,
    formData: any
  ) => {
    const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
    const weight = parseFloat(formData.weight);
    const medicalConditions = Array.isArray(formData.selectedConditions) 
      ? formData.selectedConditions 
      : [];

    return {
      user_id: userId,
      medication,
      plan_type: formattedPlan,
      amount,
      medical_conditions: medicalConditions,
      patient_height: isNaN(height) ? null : height,
      patient_weight: isNaN(weight) ? null : weight,
      status: 'draft' as const
    };
  };

  const handlePlanSelect = async (plan: string) => {
    try {
      const formattedPlan = formatPlanType(plan);
      console.log('Formatted plan:', formattedPlan);

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
      validatePlanSelection(plan, medication);

      const amount = calculateAmount(medication, formattedPlan);
      if (!amount) {
        toast({
          title: "Error",
          description: "Invalid plan or medication selected",
          variant: "destructive",
        });
        return;
      }

      const assessmentData = prepareAssessmentData(
        user.id,
        medication,
        formattedPlan,
        amount,
        formData
      );

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();

      console.log('Saving assessment with data:', assessmentData);

      let data;
      if (existingDraft) {
        const { data: updatedData, error: updateError } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        data = updatedData;
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('assessments')
          .insert(assessmentData)
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        data = newData;
      }

      if (!data) {
        throw new Error("Failed to save assessment");
      }

      console.log('Assessment saved successfully:', data);
      onSuccess(formattedPlan, data.id);
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