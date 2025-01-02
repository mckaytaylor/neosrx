import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill } from "lucide-react";
import { PricingPlans } from "@/components/PricingPlans";
import { PaymentStep } from "@/components/PaymentStep";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Medical History</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="medicalConditions">Do you have any pre-existing medical conditions?</Label>
                <Input
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="List any conditions..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="allergies">Do you have any allergies?</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any allergies..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currentMedications">Are you currently taking any medications?</Label>
                <Input
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  placeholder="List current medications..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Medication Selection</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Please select which medication you are interested in:
            </p>
            <RadioGroup
              value={formData.selectedMedication}
              onValueChange={(value) => setFormData({ ...formData, selectedMedication: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="tirzepatide" id="tirzepatide" />
                <Label htmlFor="tirzepatide" className="flex-1">
                  <div className="font-medium">Tirzepatide</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="semaglutide" id="semaglutide" />
                <Label htmlFor="semaglutide" className="flex-1">
                  <div className="font-medium">Semaglutide</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
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
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h3>
            <p className="text-muted-foreground">
              Let's continue with your application process.
            </p>
          </div>
        );
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