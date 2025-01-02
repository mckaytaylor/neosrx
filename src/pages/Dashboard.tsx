import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { AssessmentsList } from "@/components/dashboard/AssessmentsList";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const totalSteps = 7;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const isProvider = user.app_metadata?.is_provider === true;
      
      if (isProvider) {
        navigate("/provider/dashboard");
        return null;
      }

      return user;
    },
    retry: false
  });

  // Handle state from navigation
  useEffect(() => {
    const state = location.state as { startNew?: boolean; continueAssessment?: boolean };
    if (state?.startNew || state?.continueAssessment) {
      setShowAssessmentForm(true);
    } else {
      setShowAssessmentForm(false);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    cellPhone: "",
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
    selectedMedication: "",
    selectedPlan: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    assessment: null
  });

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

        const { data, error } = await supabase
          .from("assessments")
          .insert({
            user_id: user.id,
            plan_type: formData.selectedPlan,
            medication: formData.selectedMedication,
            amount: getPlanAmount(formData.selectedMedication, formData.selectedPlan),
            medical_conditions: formData.selectedConditions,
            patient_height: parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0'),
            patient_weight: parseInt(formData.weight),
            shipping_address: formData.shippingAddress,
            shipping_city: formData.shippingCity,
            shipping_state: formData.shippingState,
            shipping_zip: formData.shippingZip
          })
          .select()
          .single();

        if (error) throw error;
        setSubscriptionId(data?.id);
        setSubscription(data);
      } catch (error) {
        console.error('Error saving assessment:', error);
        toast({
          title: "Error",
          description: "Failed to save assessment. Please try again.",
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

  return (
    <div className="container mx-auto p-6">
      <DashboardHeader onLogout={handleLogout} />
      {showAssessmentForm ? (
        <DashboardContent
          currentStep={currentStep}
          totalSteps={totalSteps}
          formData={formData}
          setFormData={setFormData}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          subscriptionId={subscriptionId}
          subscription={subscription}
        />
      ) : (
        <AssessmentsList />
      )}
    </div>
  );
};

export default Dashboard;
