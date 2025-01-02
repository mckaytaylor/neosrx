import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProviderDashboard from "@/components/ProviderDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { PricingPlans } from "@/components/PricingPlans";
import { PaymentStep } from "@/components/PaymentStep";
import { MedicalHistoryForm } from "@/components/MedicalHistoryForm";
import { BasicInfoForm } from "@/components/BasicInfoForm";
import { MedicationSelection } from "@/components/MedicationSelection";
import { Welcome } from "@/components/Welcome";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { StepsNavigation } from "@/components/StepsNavigation";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const [isProvider, setIsProvider] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        const isProviderUser = user.user_metadata?.role === 'provider' && 
                             user.user_metadata?.provider === true;
        
        setIsProvider(isProviderUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        toast({
          title: "Error",
          description: "Failed to verify user role. Please try logging in again.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkUserRole();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      {isProvider ? (
        <ProviderDashboard />
      ) : (
        <PatientDashboard />
      )}
    </div>
  );
};

// Separate the patient dashboard content into its own component
const PatientDashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 6;
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Basic Info
    dateOfBirth: "",
    gender: "",
    cellPhone: "",
    // Medical History
    selectedConditions: [] as string[],
    otherCondition: "",
    medullaryThyroidCancer: "",
    familyMtcHistory: "",
    men2: "",
    pregnantOrBreastfeeding: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
    exerciseActivity: "",
    takingMedications: "",
    medicationsList: "",
    previousGlp1: "",
    recentGlp1: "",
    hasAllergies: "",
    allergiesList: "",
    takingBloodThinners: "",
    // Medication Selection
    selectedMedication: "",
    // Plan Selection
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
        setSubscription(data);
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

export default Dashboard;
