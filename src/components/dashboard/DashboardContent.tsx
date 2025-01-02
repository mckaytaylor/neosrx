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
            onMedicationSelect={(medication) =>
              setFormData({ ...formData, selectedMedication: medication })
            }
          />
        );
      case 4:
        return (
          <PricingPlans
            selectedMedication={formData.selectedMedication}
            selectedPlan={formData.selectedPlan}
            onPlanSelect={(plan) => setFormData({ ...formData, selectedPlan: plan })}
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