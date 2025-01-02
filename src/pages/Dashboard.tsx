import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { PricingPlans } from "@/components/PricingPlans";
import { PaymentStep } from "@/components/PaymentStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { MedicalHistoryForm } from "@/components/MedicalHistoryForm";
import { MedicationSelection } from "@/components/MedicationSelection";
import { Welcome } from "@/components/Welcome";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 6;
  const { toast } = useToast();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    selectedMedication: "",
    selectedPlan: ""
  });

  const handleNext = async () => {
    if (currentStep === 4 && formData.selectedPlan) {
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

        const { data, error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan_type: formData.selectedPlan,
          medication: formData.selectedMedication,
          amount: getPlanAmount(formData.selectedMedication, formData.selectedPlan),
        }).select().single();

        if (error) throw error;
        setSubscriptionId(data.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getPlanAmount = (medication: string, plan: string): number => {
    const prices = {
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
    return prices[medication.toLowerCase()]?.[plan] || 0;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <MedicalHistoryForm
            formData={formData}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />
        );
      case 3:
        return (
          <MedicationSelection
            selectedMedication={formData.selectedMedication}
            onMedicationSelect={(medication) => setFormData({ ...formData, selectedMedication: medication })}
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
            onSuccess={() => setCurrentStep(currentStep + 1)}
            onBack={handlePrevious}
          />
        ) : (
          <div className="text-center">
            <p className="text-red-500">Error loading subscription details</p>
          </div>
        );
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Patient Application</CardTitle>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} className="mt-2" />
        </CardHeader>
        <CardContent>
          {renderStep()}
          {currentStep !== 5 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStep === totalSteps || (currentStep === 4 && !formData.selectedPlan)}
              >
                {currentStep === 4 ? 'Continue to Payment' : 'Next'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;