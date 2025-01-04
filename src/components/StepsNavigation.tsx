import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StepsNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
  formData?: any;
}

type AssessmentStatus = "draft" | "completed" | "prescribed" | "denied";

export const StepsNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isNextDisabled = false,
  formData,
}: StepsNavigationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only hide navigation on payment and confirmation screens (steps 6 and 7)
  if (currentStep === 6 || currentStep === 7) return null;

  const handleSaveAndExit = async () => {
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

      // Check if we have a draft assessment ID
      if (!formData?.id) {
        // Create a new assessment if we don't have an ID
        const { data: newAssessment, error: createError } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            medication: "semaglutide",
            plan_type: "4 months",
            amount: 640,
            status: 'draft' as AssessmentStatus
          })
          .select()
          .single();

        if (createError) throw createError;
        formData = { ...formData, id: newAssessment.id };
      }

      // Convert radio button values to boolean
      const assessmentData = {
        user_id: user.id,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        cell_phone: formData.cellPhone || null,
        medical_conditions: formData.selectedConditions || [],
        other_medical_conditions: formData.otherCondition || null,
        medullary_thyroid_cancer: formData.medullaryThyroidCancer === "yes",
        family_mtc_history: formData.familyMtcHistory === "yes",
        men2: formData.men2 === "yes",
        pregnant_or_breastfeeding: formData.pregnantOrBreastfeeding === "yes",
        patient_height: parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0'),
        patient_weight: parseFloat(formData.weight) || null,
        exercise_activity: formData.exerciseActivity || null,
        taking_medications: formData.takingMedications === "yes",
        medications_list: formData.medicationsList || null,
        previous_glp1: formData.previousGlp1 === "yes",
        recent_glp1: formData.recentGlp1 === "yes",
        has_allergies: formData.hasAllergies === "yes",
        allergies_list: formData.allergiesList || null,
        taking_blood_thinners: formData.takingBloodThinners === "yes",
        medication: formData.selectedMedication || "semaglutide",
        plan_type: formData.selectedPlan || "4 months",
        shipping_address: formData.shippingAddress || null,
        shipping_city: formData.shippingCity || null,
        shipping_state: formData.shippingState || null,
        shipping_zip: formData.shippingZip || null,
        status: 'draft' as AssessmentStatus,
        amount: 640
      };

      console.log('Saving before exit:', assessmentData);

      const { error } = await supabase
        .from('assessments')
        .update(assessmentData)
        .eq('id', formData.id);

      if (error) throw error;

      toast({
        title: "Progress saved",
        description: "Your progress has been saved successfully.",
      });

      // Navigate back to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveAndExit}
        >
          Save & Exit
        </Button>
      </div>
      <Button
        onClick={onNext}
        disabled={isNextDisabled || currentStep === totalSteps}
      >
        {currentStep === 5 ? 'Continue to Payment' : 'Next'}
      </Button>
    </div>
  );
};