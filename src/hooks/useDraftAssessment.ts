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
            selectedConditions: assessment.medical_conditions || [],
            weight: assessment.patient_weight?.toString() || "",
            heightFeet: Math.floor((assessment.patient_height || 0) / 12).toString(),
            heightInches: ((assessment.patient_height || 0) % 12).toString(),
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
          medical_conditions: formData.selectedConditions || [],
          patient_height: isNaN(height) ? null : height,
          patient_weight: isNaN(weight) ? null : weight,
          medication: formData.selectedMedication || null,
          plan_type: formData.selectedPlan || null,
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