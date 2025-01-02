import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlanSelection } from "./PlanSelectionHandler";
import { usePaymentSuccess } from "./PaymentSuccessHandler";
import { AssessmentSteps } from "./AssessmentSteps";
import { StepsNavigation } from "@/components/StepsNavigation";

interface DashboardContentProps {
  currentStep: number;
  totalSteps: number;
  formData: any;
  setFormData: (data: any) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  subscriptionId: string | null;
  subscription: any;
}

export const DashboardContent = ({
  currentStep,
  totalSteps,
  formData,
  setFormData,
  handleNext,
  handlePrevious,
  subscriptionId,
  subscription,
}: DashboardContentProps) => {
  const { toast } = useToast();
  const [draftAssessmentId, setDraftAssessmentId] = useState<string | null>(null);
  
  const { handlePlanSelect } = usePlanSelection({
    formData,
    onSuccess: (plan, assessmentId) => {
      setFormData({ ...formData, selectedPlan: plan });
      setFormData(prev => ({ ...prev, assessmentId }));
      handleNext();
    },
  });

  const { handlePaymentSuccess } = usePaymentSuccess({
    formData,
    onSuccess: (assessment) => {
      setFormData(prev => ({ ...prev, assessment }));
      handleNext();
    },
  });

  // Load draft assessment data on mount
  useEffect(() => {
    const loadDraftAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: assessments, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // No rows returned
            console.error('Error loading draft assessment:', error);
          }
          return;
        }

        if (assessments) {
          setDraftAssessmentId(assessments.id);
          // Update form data with saved values
          setFormData({
            ...formData,
            selectedConditions: assessments.medical_conditions || [],
            weight: assessments.patient_weight?.toString() || "",
            heightFeet: Math.floor((assessments.patient_height || 0) / 12).toString(),
            heightInches: ((assessments.patient_height || 0) % 12).toString(),
            selectedMedication: assessments.medication || "",
            selectedPlan: assessments.plan_type || "",
            shippingAddress: assessments.shipping_address || "",
            shippingCity: assessments.shipping_city || "",
            shippingState: assessments.shipping_state || "",
            shippingZip: assessments.shipping_zip || "",
          });
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

        const assessmentData = {
          user_id: user.id,
          medical_conditions: formData.selectedConditions,
          patient_height: isNaN(height) ? null : height,
          patient_weight: isNaN(weight) ? null : weight,
          medication: formData.selectedMedication || null,
          plan_type: formData.selectedPlan || null,
          shipping_address: formData.shippingAddress || null,
          shipping_city: formData.shippingCity || null,
          shipping_state: formData.shippingState || null,
          shipping_zip: formData.shippingZip || null,
          status: 'draft',
          amount: 0, // Will be set when plan is selected
        };

        if (draftAssessmentId) {
          // Update existing draft
          const { error } = await supabase
            .from('assessments')
            .update(assessmentData)
            .eq('id', draftAssessmentId);

          if (error) throw error;
        } else {
          // Create new draft
          const { data, error } = await supabase
            .from('assessments')
            .insert(assessmentData)
            .select()
            .single();

          if (error) throw error;
          if (data) setDraftAssessmentId(data.id);
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

    // Only save if we have some data to save
    if (formData.selectedConditions?.length > 0 || formData.weight || formData.heightFeet) {
      saveDraftAssessment();
    }
  }, [formData]);

  const handleMedicationSelect = async (medication: string) => {
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

      setFormData({ ...formData, selectedMedication: medication });
      handleNext();
    } catch (error) {
      console.error("Error selecting medication:", error);
      toast({
        title: "Error",
        description: "Failed to select medication. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Application</CardTitle>
        {currentStep < 7 && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} className="mt-2" />
        )}
      </CardHeader>
      <CardContent>
        <AssessmentSteps
          currentStep={currentStep}
          formData={formData}
          onFormDataChange={setFormData}
          onMedicationSelect={handleMedicationSelect}
          onPlanSelect={handlePlanSelect}
          onPaymentSuccess={handlePaymentSuccess}
          onPrevious={handlePrevious}
        />
        <StepsNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isNextDisabled={currentStep === 4 && !formData.selectedPlan}
        />
      </CardContent>
    </Card>
  );
};