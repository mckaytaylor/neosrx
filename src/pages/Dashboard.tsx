import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { AssessmentsList } from "@/components/dashboard/AssessmentsList";
import { Loader } from "lucide-react";

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

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth check error:", error);
          navigate("/");
          return;
        }

        if (!session) {
          navigate("/");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        // Don't redirect on network errors, just log them
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