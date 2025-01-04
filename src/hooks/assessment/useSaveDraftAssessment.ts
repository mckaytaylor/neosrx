import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AssessmentFormData } from "@/types/assessment";
import { calculateAmount } from "@/utils/pricingUtils";

export const useSaveDraftAssessment = (formData: AssessmentFormData, draftAssessmentId: string | null) => {
  const { toast } = useToast();

  useEffect(() => {
    const saveDraftAssessment = async () => {
      try {
        if (!draftAssessmentId) {
          console.log('No draft assessment ID available');
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return;
        }

        console.log('Saving draft assessment:', { formData, draftAssessmentId });
        const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
        const weight = parseFloat(formData.weight);

        // Calculate the amount based on the selected medication and plan
        const amount = formData.selectedMedication && formData.selectedPlan
          ? calculateAmount(formData.selectedMedication, formData.selectedPlan)
          : 499; // Default amount

        console.log('Calculated amount:', { 
          medication: formData.selectedMedication, 
          plan: formData.selectedPlan, 
          amount 
        });

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
          patient_height: isNaN(height) ? null : height,
          patient_weight: isNaN(weight) ? null : weight,
          exercise_activity: formData.exerciseActivity || null,
          taking_medications: formData.takingMedications === "yes",
          medications_list: formData.medicationsList || null,
          previous_glp1: formData.previousGlp1 === "yes",
          recent_glp1: formData.recentGlp1 === "yes",
          has_allergies: formData.hasAllergies === "yes",
          allergies_list: formData.allergiesList || null,
          taking_blood_thinners: formData.takingBloodThinners === "yes",
          medication: formData.selectedMedication || "tirzepatide",
          plan_type: formData.selectedPlan || "1 month",
          amount: amount,
          shipping_address: formData.shippingAddress || null,
          shipping_city: formData.shippingCity || null,
          shipping_state: formData.shippingState || null,
          shipping_zip: formData.shippingZip || null,
          status: 'draft' as const
        };

        console.log('Saving assessment data:', assessmentData);

        const { error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', draftAssessmentId);

        if (error) {
          console.error('Error saving draft assessment:', error);
          toast({
            title: "Error",
            description: "Failed to save your progress. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log('Successfully saved draft assessment');
      } catch (error) {
        console.error('Error in saveDraftAssessment:', error);
        toast({
          title: "Error",
          description: "Failed to save your progress. Please try again.",
          variant: "destructive",
        });
      }
    };

    // Save draft after a short delay to avoid too frequent updates
    const debounceTimeout = setTimeout(saveDraftAssessment, 500);
    return () => clearTimeout(debounceTimeout);
  }, [formData, draftAssessmentId, toast]);
};