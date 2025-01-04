import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateAmount } from "@/utils/pricingUtils";

interface AssessmentData {
  medication: string;
  plan_type: string;
  amount: number;
  medical_conditions: string[];
  patient_height: number | null;
  patient_weight: number | null;
}

export const useAssessmentManagement = () => {
  const { toast } = useToast();

  const saveAssessment = async (
    userId: string,
    formData: any,
    plan: string
  ): Promise<{ id: string } | null> => {
    try {
      const medication = formData.selectedMedication?.toLowerCase();
      const amount = calculateAmount(medication, plan);
      
      if (!amount) {
        toast({
          title: "Error",
          description: "Invalid plan or medication selected",
          variant: "destructive",
        });
        return null;
      }

      const medicalConditions = Array.isArray(formData.selectedConditions) 
        ? formData.selectedConditions 
        : [];

      const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
      const weight = parseInt(formData.weight);

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'draft')
        .single();

      const assessmentData: AssessmentData = {
        medication,
        plan_type: plan,
        amount,
        medical_conditions: medicalConditions,
        patient_height: isNaN(height) ? null : height,
        patient_weight: isNaN(weight) ? null : weight,
      };

      console.log('Saving assessment with data:', assessmentData);

      if (existingDraft) {
        const { data, error } = await supabase
          .from('assessments')
          .update({ ...assessmentData, status: 'draft' })
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('assessments')
          .insert({
            ...assessmentData,
            user_id: userId,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error: any) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateAssessmentStatus = async (assessmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ status })
        .eq('id', assessmentId);

      if (error) {
        console.error('Error updating assessment status:', error);
        throw new Error("Failed to update assessment status");
      }

      console.log(`Assessment ${assessmentId} status updated to ${status}`);
    } catch (error: any) {
      console.error("Error updating assessment status:", error);
      throw error;
    }
  };

  return {
    saveAssessment,
    updateAssessmentStatus,
  };
};