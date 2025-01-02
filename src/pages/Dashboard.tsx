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
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    cellPhone: "",
    selectedConditions: [] as string[],
    otherCondition: "",
    weight: "",
    heightFeet: "",
    heightInches: "",
    exerciseActivity: "",
  });
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

  const handleFormChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  if (isProvider) {
    return <ProviderDashboard />;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Welcome />
      <div className="mt-8">
        {currentStep === 1 && (
          <BasicInfoForm
            formData={formData}
            onChange={handleFormChange}
          />
        )}
        {currentStep === 2 && (
          <MedicalHistoryForm
            formData={formData}
            onChange={handleFormChange}
          />
        )}
        {currentStep === 3 && (
          <MedicationSelection
            formData={formData}
            onChange={handleFormChange}
          />
        )}
        {currentStep === 4 && (
          <PricingPlans
            formData={formData}
            onChange={handleFormChange}
          />
        )}
        {currentStep === 5 && (
          <PaymentStep
            formData={formData}
            onChange={handleFormChange}
          />
        )}
        {currentStep === 6 && assessment && (
          <ConfirmationScreen
            subscription={{
              medication: assessment.medication,
              plan_type: assessment.plan_type,
              amount: assessment.amount
            }}
          />
        )}
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