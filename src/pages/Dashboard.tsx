import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 7; // Updated to include shipping step
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Fetch user data and assessment
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if user is a provider
      const isProvider = user.app_metadata?.is_provider === true;
      
      if (window.location.pathname === "/" && isProvider) {
        navigate("/provider/dashboard");
        return null;
      }
      
      if (window.location.pathname === "/provider/dashboard" && !isProvider) {
        navigate("/");
        return null;
      }

      return user;
    },
    retry: false
  });

  // Fetch latest assessment
  const { data: latestAssessment } = useQuery({
    queryKey: ['latest-assessment'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching assessment:', error);
        return null;
      }

      return data;
    },
    enabled: !!userData
  });

  // Handle assessment data persistence
  useEffect(() => {
    if (latestAssessment) {
      setSubscription(latestAssessment);
      setSubscriptionId(latestAssessment.id);
      
      // If we have a completed assessment and showCompletedOrder is true, show the confirmation screen
      if (location.state?.showCompletedOrder && latestAssessment.status === 'active') {
        setCurrentStep(6);
      }
    }
  }, [latestAssessment, location.state]);

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
    </div>
  );
};

export default Dashboard;