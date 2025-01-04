import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AssessmentFormData } from "@/types/assessment";

export const useLoadDraftAssessment = (setFormData: (data: AssessmentFormData) => void) => {
  const [draftAssessmentId, setDraftAssessmentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadDraftAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: assessment, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) {
          console.error('Error loading draft assessment:', error);
          return;
        }

        if (assessment) {
          console.log('Found draft assessment:', assessment);
          setDraftAssessmentId(assessment.id);
          setFormData({
            dateOfBirth: assessment.date_of_birth || "",
            gender: assessment.gender || "",
            cellPhone: assessment.cell_phone || "",
            selectedConditions: assessment.medical_conditions || [],
            otherCondition: assessment.other_medical_conditions || "",
            medullaryThyroidCancer: assessment.medullary_thyroid_cancer?.toString() || "",
            familyMtcHistory: assessment.family_mtc_history?.toString() || "",
            men2: assessment.men2?.toString() || "",
            pregnantOrBreastfeeding: assessment.pregnant_or_breastfeeding?.toString() || "",
            weight: assessment.patient_weight?.toString() || "",
            heightFeet: Math.floor((assessment.patient_height || 0) / 12).toString(),
            heightInches: ((assessment.patient_height || 0) % 12).toString(),
            exerciseActivity: assessment.exercise_activity || "",
            takingMedications: assessment.taking_medications?.toString() || "",
            medicationsList: assessment.medications_list || "",
            previousGlp1: assessment.previous_glp1?.toString() || "",
            recentGlp1: assessment.recent_glp1?.toString() || "",
            hasAllergies: assessment.has_allergies?.toString() || "",
            allergiesList: assessment.allergies_list || "",
            takingBloodThinners: assessment.taking_blood_thinners?.toString() || "",
            selectedMedication: assessment.medication || "",
            selectedPlan: assessment.plan_type || "",
            shippingAddress: assessment.shipping_address || "",
            shippingCity: assessment.shipping_city || "",
            shippingState: assessment.shipping_state || "",
            shippingZip: assessment.shipping_zip || "",
            assessment: null
          });
        } else {
          console.log('No draft assessment found');
          // Only create a new draft if explicitly requested via state
          const state = window.history.state?.usr;
          if (state?.startNew) {
            const { data: newAssessment, error: createError } = await supabase
              .from('assessments')
              .insert({
                user_id: user.id,
                status: 'draft',
                medication: 'tirzepatide',
                plan_type: '1 month',
                amount: 499
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating draft assessment:', createError);
              return;
            }

            if (newAssessment) {
              setDraftAssessmentId(newAssessment.id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading draft assessment:', error);
      }
    };

    loadDraftAssessment();
  }, [setFormData]);

  return { draftAssessmentId };
};