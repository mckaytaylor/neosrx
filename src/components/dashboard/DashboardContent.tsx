import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlanSelection } from "./PlanSelectionHandler";
import { usePaymentSuccess } from "./PaymentSuccessHandler";
import { AssessmentSteps } from "./AssessmentSteps";
import { StepsNavigation } from "@/components/StepsNavigation";
import { useDraftAssessment } from "@/hooks/useDraftAssessment";

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
  
  const { draftAssessmentId } = useDraftAssessment(formData, setFormData);
  
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

  const isShippingComplete = () => {
    return (
      formData.shippingAddress?.trim() &&
      formData.shippingCity?.trim() &&
      formData.shippingState?.trim() &&
      formData.shippingZip?.trim()
    );
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
          isNextDisabled={
            (currentStep === 4 && !formData.selectedPlan) ||
            (currentStep === 5 && !isShippingComplete())
          }
        />
      </CardContent>
    </Card>
  );
};