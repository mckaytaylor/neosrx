import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePaymentSuccess = ({ formData, onSuccess }: { formData: any, onSuccess: (assessment: any) => void }) => {
  const { toast } = useToast();
  
  const handlePaymentSuccess = async (assessmentId: string) => {
    try {
      console.log('Updating assessment status for ID:', assessmentId); // Debug log
      
      // Update the assessment status to completed
      const { data, error } = await supabase
        .from("assessments")
        .update({ 
          status: "completed",
          // Ensure all form data is properly saved on completion
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          cell_phone: formData.cellPhone || null,
          medical_conditions: Array.isArray(formData.selectedConditions) ? formData.selectedConditions : [],
          other_medical_conditions: formData.otherCondition || null,
          patient_height: parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0'),
          patient_weight: parseFloat(formData.weight) || null,
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
          taking_blood_thinners: formData.takingBloodThinners === "yes"
        })
        .eq("id", assessmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating assessment:', error); // Debug log
        throw error;
      }

      console.log('Successfully updated assessment:', data); // Debug log

      toast({
        title: "Payment successful",
        description: "Your assessment has been submitted for review.",
      });

      if (data) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Error updating assessment status:", error);
      toast({
        title: "Error",
        description: "Failed to update assessment status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return { handlePaymentSuccess };
};

export const PaymentSuccessHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assessmentId = searchParams.get("assessment_id");

  useEffect(() => {
    const updateAssessmentStatus = async () => {
      if (!assessmentId) {
        console.log('No assessment ID found in URL parameters'); // Debug log
        return;
      }

      try {
        console.log('Updating assessment status for ID:', assessmentId); // Debug log
        
        const { data, error } = await supabase
          .from("assessments")
          .update({ status: "completed" })
          .eq("id", assessmentId)
          .select()
          .single();

        if (error) {
          console.error('Error updating assessment:', error); // Debug log
          throw error;
        }

        console.log('Successfully updated assessment:', data); // Debug log

        toast({
          title: "Payment successful",
          description: "Your assessment has been submitted for review.",
        });

        navigate("/dashboard");
      } catch (error) {
        console.error("Error updating assessment status:", error);
        toast({
          title: "Error",
          description: "Failed to update assessment status. Please contact support.",
          variant: "destructive",
        });
      }
    };

    updateAssessmentStatus();
  }, [assessmentId, navigate, toast]);

  return null;
};