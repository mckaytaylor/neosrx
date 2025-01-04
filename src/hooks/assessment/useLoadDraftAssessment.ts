import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AssessmentFormData } from "@/types/assessment";
import { calculateAmount } from "@/utils/pricingUtils";

export const useLoadDraftAssessment = (setFormData: (data: AssessmentFormData) => void) => {
  const [draftAssessmentId, setDraftAssessmentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadDraftAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found');
          return;
        }

        console.log('Fetching draft assessment for user:', user.id);
        const { data: assessment, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) {
          console.error('Error loading draft assessment:', error);
          toast({
            title: "Error",
            description: "Failed to load your draft assessment. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (assessment) {
          console.log('Found draft assessment:', assessment);
          
          // Recalculate amount based on medication and plan type
          const calculatedAmount = assessment.medication && assessment.plan_type
            ? calculateAmount(assessment.medication, assessment.plan_type)
            : 499; // Default to minimum amount if no plan selected

          console.log('Calculated amount for draft:', {
            medication: assessment.medication,
            plan: assessment.plan_type,
            calculatedAmount,
            currentAmount: assessment.amount
          });

          if (calculatedAmount && calculatedAmount !== assessment.amount) {
            console.log('Updating assessment amount:', { 
              old: assessment.amount, 
              new: calculatedAmount 
            });
            
            const { error: updateError } = await supabase
              .from('assessments')
              .update({ amount: calculatedAmount })
              .eq('id', assessment.id);

            if (updateError) {
              console.error('Error updating assessment amount:', updateError);
            }

            assessment.amount = calculatedAmount;
          }

          setDraftAssessmentId(assessment.id);
          setFormData({
            dateOfBirth: assessment.date_of_birth || "",
            gender: assessment.gender || "",
            cellPhone: assessment.cell_phone || "",
            selectedConditions: assessment.medical_conditions || [],
            otherCondition: assessment.other_medical_conditions || "",
            medullaryThyroidCancer: assessment.medullary_thyroid_cancer ? "yes" : "no",
            familyMtcHistory: assessment.family_mtc_history ? "yes" : "no",
            men2: assessment.men2 ? "yes" : "no",
            pregnantOrBreastfeeding: assessment.pregnant_or_breastfeeding ? "yes" : "no",
            weight: assessment.patient_weight?.toString() || "",
            heightFeet: Math.floor((assessment.patient_height || 0) / 12).toString(),
            heightInches: ((assessment.patient_height || 0) % 12).toString(),
            exerciseActivity: assessment.exercise_activity || "",
            takingMedications: assessment.taking_medications ? "yes" : "no",
            medicationsList: assessment.medications_list || "",
            previousGlp1: assessment.previous_glp1 ? "yes" : "no",
            recentGlp1: assessment.recent_glp1 ? "yes" : "no",
            hasAllergies: assessment.has_allergies ? "yes" : "no",
            allergiesList: assessment.allergies_list || "",
            takingBloodThinners: assessment.taking_blood_thinners ? "yes" : "no",
            selectedMedication: assessment.medication || "tirzepatide",
            selectedPlan: assessment.plan_type || "1 month",
            shippingAddress: assessment.shipping_address || "",
            shippingCity: assessment.shipping_city || "",
            shippingState: assessment.shipping_state || "",
            shippingZip: assessment.shipping_zip || "",
            assessment: null
          });
        } else {
          console.log('No draft assessment found');
          const state = window.history.state?.usr;
          if (state?.startNew) {
            console.log('Creating new draft assessment');
            const { data: newAssessment, error: createError } = await supabase
              .from('assessments')
              .insert({
                user_id: user.id,
                status: 'draft',
                medication: 'tirzepatide',
                plan_type: '1 month',
                amount: 499 // Default amount for tirzepatide 1 month
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating draft assessment:', createError);
              toast({
                title: "Error",
                description: "Failed to create a new assessment. Please try again.",
                variant: "destructive",
              });
              return;
            }

            if (newAssessment) {
              console.log('Created new draft assessment:', newAssessment);
              setDraftAssessmentId(newAssessment.id);
            }
          }
        }
      } catch (error) {
        console.error('Error in loadDraftAssessment:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadDraftAssessment();
  }, [setFormData, toast]);

  return { draftAssessmentId };
};