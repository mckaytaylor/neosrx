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

interface FormData {
  dateOfBirth: string;
  gender: string;
  cellPhone: string;
  selectedConditions: string[];
  otherCondition: string;
  medullaryThyroidCancer: string;
  familyMtcHistory: string;
  men2: string;
  pregnantOrBreastfeeding: string;
  weight: string;
  heightFeet: string;
  heightInches: string;
  exerciseActivity: string;
  takingMedications: string;
  medicationsList: string;
  previousGlp1: string;
  recentGlp1: string;
  hasAllergies: string;
  allergiesList: string;
  takingBloodThinners: string;
  selectedMedication?: string;
  selectedPlan?: string;
}

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProvider, setIsProvider] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [formData, setFormData] = useState<FormData>({
    dateOfBirth: "",
    gender: "",
    cellPhone: "",
    selectedConditions: [],
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

    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAssessment(data);
        if (data.status === "completed") {
          setCurrentStep(6);
        }
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
    }
  };

  const handleFormChange = (data: Partial<FormData>) => {
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
            selectedMedication={formData.selectedMedication || ""}
            onMedicationSelect={(medication) => handleFormChange({ selectedMedication: medication })}
          />
        )}
        {currentStep === 4 && (
          <PricingPlans
            selectedMedication={formData.selectedMedication || ""}
            selectedPlan={formData.selectedPlan || ""}
            onPlanSelect={(plan) => handleFormChange({ selectedPlan: plan })}
          />
        )}
        {currentStep === 5 && assessment && (
          <PaymentStep
            subscriptionId={assessment.id}
            onSuccess={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
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
          onNext={() => setCurrentStep(prev => Math.min(prev + 1, 6))}
          onPrevious={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
        />
      </div>
    </div>
  );
};

export default Dashboard;