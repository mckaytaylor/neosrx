import { BasicInfoForm } from "@/components/BasicInfoForm";
import { MedicalHistoryForm } from "@/components/MedicalHistoryForm";
import { MedicationSelection } from "@/components/MedicationSelection";
import { PricingPlans } from "@/components/PricingPlans";
import { ShippingForm } from "@/components/ShippingForm";
import { PaymentStep } from "@/components/PaymentStep";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { Welcome } from "@/components/Welcome";

interface AssessmentStepsProps {
  currentStep: number;
  formData: any;
  onFormDataChange: (data: any) => void;
  onMedicationSelect: (medication: string) => void;
  onPlanSelect: (plan: any) => void;
  onPaymentSuccess: (assessmentId: string) => void;
  onPrevious: () => void;
}

export const AssessmentSteps = ({
  currentStep,
  formData,
  onFormDataChange,
  onMedicationSelect,
  onPlanSelect,
  onPaymentSuccess,
  onPrevious,
}: AssessmentStepsProps) => {
  switch (currentStep) {
    case 2:
      return (
        <>
          <BasicInfoForm
            formData={formData}
            onChange={(data) => onFormDataChange({ ...formData, ...data })}
          />
          <div className="mt-8">
            <MedicalHistoryForm
              formData={formData}
              onChange={(data) => onFormDataChange({ ...formData, ...data })}
            />
          </div>
        </>
      );
    case 3:
      return (
        <MedicationSelection
          selectedMedication={formData.selectedMedication}
          onMedicationSelect={onMedicationSelect}
        />
      );
    case 4:
      return (
        <PricingPlans
          selectedMedication={formData.selectedMedication}
          selectedPlan={formData.selectedPlan}
          onPlanSelect={onPlanSelect}
        />
      );
    case 5:
      return (
        <ShippingForm
          formData={formData}
          onChange={(data) => onFormDataChange({ ...formData, ...data })}
        />
      );
    case 6:
      // Check if we have a draft assessment ID from the formData
      const assessmentId = formData.id || formData.assessmentId;
      return assessmentId ? (
        <PaymentStep
          subscriptionId={assessmentId}
          onSuccess={() => onPaymentSuccess(assessmentId)}
          onBack={onPrevious}
        />
      ) : (
        <div className="text-center">
          <p className="text-red-500">Error loading assessment details</p>
        </div>
      );
    case 7:
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