import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { AssessmentsList } from "@/components/dashboard/AssessmentsList";
import { Loader } from "lucide-react";
import { AssessmentFormData } from "@/types/assessment";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const totalSteps = 7;
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  
  const [formData, setFormData] = useState<AssessmentFormData>({
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
    selectedMedication: "",
    selectedPlan: "",
    shippingAddress: "",
    shippingCity: "",
    shippingState: "",
    shippingZip: "",
    assessment: null
  });

  // Check auth status
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(checkAuth, retryDelay);
            return;
          }
          setAuthError(true);
          setIsLoading(false);
          return;
        }

        if (!session) {
          navigate("/");
          return;
        }

        setIsLoading(false);
        setAuthError(false);
      } catch (error) {
        console.error("Auth check error:", error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkAuth, retryDelay);
          return;
        }
        setAuthError(true);
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle state from navigation
  useEffect(() => {
    const state = location.state as { startNew?: boolean; continueAssessment?: boolean };
    if (state?.startNew || state?.continueAssessment) {
      setShowAssessmentForm(true);
    } else {
      setShowAssessmentForm(false);
    }
  }, [location.state]);

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
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container mx-auto p-6">
        <DashboardHeader onLogout={handleLogout} />
        <div className="flex flex-col items-center justify-center space-y-4 mt-8">
          <p className="text-gray-600">
            Experiencing connection issues. Your data is safe and will be available when the connection is restored.
          </p>
        </div>
      </div>
    );
  }

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