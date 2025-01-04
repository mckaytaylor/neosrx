import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateAmount } from "@/utils/pricingUtils";
import { getUtmParams } from "@/utils/utmUtils";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
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

      const medication = formData.selectedMedication?.toLowerCase();
      const amount = calculateAmount(medication, plan);
      
      if (!amount) {
        console.error('Invalid plan or medication selected:', { medication, plan });
        toast({
          title: "Error",
          description: "Invalid plan or medication selected",
          variant: "destructive",
        });
        return;
      }

      console.log('Selected plan pricing:', { medication, plan, amount });

      // Get current UTM parameters or fetch from profile if none present
      const currentUtmParams = getUtmParams();
      let utmParams = currentUtmParams;

      // If no current UTM parameters, fetch from profile
      if (!Object.values(currentUtmParams).some(value => value !== null)) {
        console.log('No UTM params in URL, fetching from profile...');
        const { data: profileData } = await supabase
          .from('profiles')
          .select('utm_source, utm_medium, utm_campaign, utm_term, utm_content')
          .eq('id', user.id)
          .single();

        if (profileData) {
          console.log('Found UTM params in profile:', profileData);
          utmParams = {
            utm_source: profileData.utm_source,
            utm_medium: profileData.utm_medium,
            utm_campaign: profileData.utm_campaign,
            utm_term: profileData.utm_term,
            utm_content: profileData.utm_content,
          };
        }
      }

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();

      const assessmentData = {
        medication,
        plan_type: plan,
        amount,
        medical_conditions: formData.selectedConditions || [],
        patient_height: parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0'),
        patient_weight: parseFloat(formData.weight) || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        cell_phone: formData.cellPhone || null,
        other_medical_conditions: formData.otherCondition || null,
        medullary_thyroid_cancer: formData.medullaryThyroidCancer === "yes",
        family_mtc_history: formData.familyMtcHistory === "yes",
        men2: formData.men2 === "yes",
        pregnant_or_breastfeeding: formData.pregnantOrBreastfeeding === "yes",
        exercise_activity: formData.exerciseActivity || null,
        taking_medications: formData.takingMedications === "yes",
        medications_list: formData.medicationsList || null,
        previous_glp1: formData.previousGlp1 === "yes",
        recent_glp1: formData.recentGlp1 === "yes",
        has_allergies: formData.hasAllergies === "yes",
        allergies_list: formData.allergiesList || null,
        taking_blood_thinners: formData.takingBloodThinners === "yes",
        shipping_address: formData.shippingAddress || null,
        shipping_city: formData.shippingCity || null,
        shipping_state: formData.shippingState || null,
        shipping_zip: formData.shippingZip || null,
        ...utmParams
      };

      if (existingDraft) {
        console.log('Updating existing draft:', { 
          id: existingDraft.id,
          ...assessmentData
        });

        const { data, error } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        console.log('Successfully updated draft assessment:', data);
        onSuccess(plan, data.id);
      } else {
        console.log('Creating new assessment:', assessmentData);

        const { data, error } = await supabase
          .from('assessments')
          .insert({
            ...assessmentData,
            user_id: user.id,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;
        console.log('Successfully created new assessment:', data);
        onSuccess(plan, data.id);
      }
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