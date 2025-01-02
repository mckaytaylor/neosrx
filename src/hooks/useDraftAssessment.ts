import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDraftAssessment = (formData: any, setFormData: (data: any) => void) => {
  const [draftAssessmentId, setDraftAssessmentId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load draft assessment data on mount
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
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error loading draft assessment:', error);
          return;
        }

        if (assessment) {
          console.log('Found draft assessment:', assessment);
          setDraftAssessmentId(assessment.id);
          // Update form data with saved values
          setFormData({
            ...formData,
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
          });
        } else {
          console.log('No draft assessment found');
        }
      } catch (error) {
        console.error('Error loading draft assessment:', error);
      }
    };

    loadDraftAssessment();
  }, []);

  // Save form data as draft when it changes
  useEffect(() => {
    const saveDraftAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
        const weight = parseFloat(formData.weight);

        // Only proceed if we have some data to save
        if (!formData.selectedConditions?.length && !formData.weight && !formData.heightFeet) {
          return;
        }

        const assessmentData = {
          user_id: user.id,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          cell_phone: formData.cellPhone || null,
          medical_conditions: formData.selectedConditions || [],
          other_medical_conditions: formData.otherCondition || null,
          medullary_thyroid_cancer: formData.medullaryThyroidCancer === "yes" || null,
          family_mtc_history: formData.familyMtcHistory === "yes" || null,
          men2: formData.men2 === "yes" || null,
          pregnant_or_breastfeeding: formData.pregnantOrBreastfeeding === "yes" || null,
          patient_height: isNaN(height) ? null : height,
          patient_weight: isNaN(weight) ? null : weight,
          exercise_activity: formData.exerciseActivity || null,
          taking_medications: formData.takingMedications === "yes" || null,
          medications_list: formData.medicationsList || null,
          previous_glp1: formData.previousGlp1 === "yes" || null,
          recent_glp1: formData.recentGlp1 === "yes" || null,
          has_allergies: formData.hasAllergies === "yes" || null,
          allergies_list: formData.allergiesList || null,
          taking_blood_thinners: formData.takingBloodThinners === "yes" || null,
          medication: formData.selectedMedication || "pending",
          plan_type: formData.selectedPlan || "pending",
          shipping_address: formData.shippingAddress || null,
          shipping_city: formData.shippingCity || null,
          shipping_state: formData.shippingState || null,
          shipping_zip: formData.shippingZip || null,
          status: 'draft',
          amount: 0
        };

        if (draftAssessmentId) {
          // Update existing draft
          const { error } = await supabase
            .from('assessments')
            .update(assessmentData)
            .eq('id', draftAssessmentId);

          if (error) {
            console.error('Error updating draft:', error);
            throw error;
          }
        } else {
          // Create new draft
          const { data, error } = await supabase
            .from('assessments')
            .insert(assessmentData)
            .select()
            .single();

          if (error) {
            console.error('Error creating draft:', error);
            throw error;
          }
          if (data) {
            console.log('Created new draft assessment:', data);
            setDraftAssessmentId(data.id);
          }
        }
      } catch (error) {
        console.error('Error saving draft assessment:', error);
        toast({
          title: "Error",
          description: "Failed to save your progress. Please try again.",
          variant: "destructive",
        });
      }
    };

    saveDraftAssessment();
  }, [formData]);

  return { draftAssessmentId };
};