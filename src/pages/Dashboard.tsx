import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Welcome } from "@/components/Welcome";
import { StepsNavigation } from "@/components/StepsNavigation";
import { BasicInfoForm } from "@/components/BasicInfoForm";
import { MedicalHistoryForm } from "@/components/MedicalHistoryForm";
import { MedicationSelection } from "@/components/MedicationSelection";
import { PricingPlans } from "@/components/PricingPlans";
import { PaymentStep } from "@/components/PaymentStep";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { ProviderDashboard } from "@/components/ProviderDashboard";

interface Assessment {
  id: string;
  user_id: string;
  plan_type: string;
  medication: string;
  amount: number;
  status: string;
  created_at: string;
  assessment_date: string | null;
  patient_weight: number | null;
  patient_height: number | null;
  medical_conditions: string[] | null;
}

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProvider, setIsProvider] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    checkProviderStatus();
    fetchAssessment();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
    }
  };

  const checkProviderStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.app_metadata.provider) {
      setIsProvider(true);
    }
  };

  const fetchAssessment = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching assessment:", error);
    }

    if (data) {
      setAssessment(data);
      // If assessment exists and is complete, show confirmation screen
      if (data.status === "completed") {
        setCurrentStep(6);
      }
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (isProvider) {
    return <ProviderDashboard />;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Welcome />
      <div className="mt-8">
        {currentStep === 1 && <BasicInfoForm onNext={handleNext} />}
        {currentStep === 2 && <MedicalHistoryForm onNext={handleNext} />}
        {currentStep === 3 && <MedicationSelection onNext={handleNext} />}
        {currentStep === 4 && <PricingPlans onNext={handleNext} />}
        {currentStep === 5 && <PaymentStep onNext={handleNext} />}
        {currentStep === 6 && <ConfirmationScreen assessment={assessment} />}
        <StepsNavigation
          currentStep={currentStep}
          totalSteps={6}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </div>
  );
};

export default Dashboard;