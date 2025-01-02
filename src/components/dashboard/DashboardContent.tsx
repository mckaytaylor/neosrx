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

      // Calculate amount based on medication and plan
      const amounts: Record<string, Record<string, number>> = {
        tirzepatide: {
          "1 month": 499,
          "3 months": 810,
          "5 months": 1300,
        },
        semaglutide: {
          "1 month": 399,
          "4 months": 640,
          "7 months": 1050,
        },
      };

      const medication = formData.selectedMedication.toLowerCase();
      if (!medication || !amounts[medication]) {
        toast({
          title: "Error",
          description: "Invalid medication selected",
          variant: "destructive",
        });
        return;
      }

      const amount = amounts[medication][plan];
      if (amount === undefined) {
        toast({
          title: "Error",
          description: "Invalid plan selected",
          variant: "destructive",
        });
        return;
      }

      // Ensure medical conditions is an array
      const medicalConditions = Array.isArray(formData.selectedConditions) 
        ? formData.selectedConditions 
        : [];

      // Parse height and weight to numbers
      const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
      const weight = parseInt(formData.weight);

      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          medication: medication,
          plan_type: plan,
          amount: amount,
          medical_conditions: medicalConditions,
          patient_height: height || null,
          patient_weight: weight || null
        })
        .select()
        .single();

      if (error) throw error;

      setFormData({ ...formData, selectedPlan: plan });
      handleNext();
    } catch (error: any) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment. Please try again.",
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
        return subscriptionId ? (
          <PaymentStep
            subscriptionId={subscriptionId}
            onSuccess={() => handleNext()}
            onBack={handlePrevious}
          />
        ) : (
          <div className="text-center">
            <p className="text-red-500">Error loading assessment details</p>
          </div>
        );
      case 6:
        return subscription ? (
          <ConfirmationScreen subscription={subscription} />
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