import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { PricingPlans } from "@/components/PricingPlans";
import { PaymentStep } from "@/components/PaymentStep";
import { MedicalHistoryForm } from "@/components/MedicalHistoryForm";
import { BasicInfoForm } from "@/components/BasicInfoForm";
import { MedicationSelection } from "@/components/MedicationSelection";
import { Welcome } from "@/components/Welcome";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepsNavigation } from "@/components/StepsNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlanSelection } from "./PlanSelectionHandler";

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
  const { handlePlanSelect } = usePlanSelection({
    formData,
    onSuccess: (plan, assessmentId) => {
      setFormData({ ...formData, selectedPlan: plan });
      setFormData(prev => ({ ...prev, assessmentId }));
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

  const handlePaymentSuccess = async (assessmentId: string) => {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) {
        console.error('Error fetching assessment:', error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, assessment }));
      handleNext();
    } catch (error) {
      console.error('Error in handlePaymentSuccess:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <>
            <BasicInfoForm
              formData={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
            <div className="mt-8">
              <MedicalHistoryForm
                formData={formData}
                onChange={(data) => setFormData({ ...formData, ...data })}
              />
            </div>
          </>
        );
      case 3:
        return (
          <MedicationSelection
            selectedMedication={formData.selectedMedication}
            onMedicationSelect={handleMedicationSelect}
          />
        );
      case 4:
        return (
          <PricingPlans
            selectedMedication={formData.selectedMedication}
            selectedPlan={formData.selectedPlan}
            onPlanSelect={handlePlanSelect}
          />
        );
      case 5:
        return formData.assessmentId ? (
          <PaymentStep
            subscriptionId={formData.assessmentId}
            onSuccess={() => handlePaymentSuccess(formData.assessmentId)}
            onBack={handlePrevious}
          />
        ) : (
          <div className="text-center">
            <p className="text-red-500">Error loading assessment details</p>
          </div>
        );
      case 6:
        return formData.assessment ? (
          <ConfirmationScreen subscription={formData.assessment} />
        ) : (
          <div className="text-center">
            <p className="text-red-500">Error loading order details</p>
          </div>
        );
      default:
        return <Welcome />;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Application</CardTitle>
        {currentStep < 6 && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} className="mt-2" />
        )}
      </CardHeader>
      <CardContent>
        {renderStep()}
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