import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { CompletedAssessmentModal } from "./CompletedAssessmentModal";
import { useToast } from "@/hooks/use-toast";
import { AssessmentCard } from "./AssessmentCard";
import { EmptyAssessmentState } from "./EmptyAssessmentState";

export const AssessmentsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  
  const { data: assessments, isLoading } = useQuery({
    queryKey: ["user-assessments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched assessments:", data);
      return data;
    },
  });

  useEffect(() => {
    if (location.state?.showConfirmation || location.state?.showCompletedOrder) {
      navigate(location.pathname, { replace: true });
      queryClient.invalidateQueries({ queryKey: ["user-assessments"] });
    }
  }, [location.state, navigate, queryClient]);

  const startNewAssessment = async () => {
    const existingDraft = assessments?.find(assessment => assessment.status === "draft");
    
    if (existingDraft) {
      navigate("/dashboard", { 
        state: { 
          continueAssessment: true, 
          assessmentId: existingDraft.id 
        } 
      });
      toast({
        title: "Existing draft found",
        description: "Continuing with your existing assessment.",
      });
    } else {
      const hasCompletedAssessment = assessments?.some(
        assessment => ["prescribed", "denied", "completed"].includes(assessment.status)
      );

      if (!hasCompletedAssessment && assessments && assessments.length > 0) {
        toast({
          title: "Cannot start new assessment",
          description: "Please complete your current assessment first.",
          variant: "destructive",
        });
        return;
      }

      navigate("/dashboard", { state: { startNew: true } });
    }
  };

  const handleViewAssessment = (assessment: any) => {
    if (assessment.status === "draft") {
      navigate("/dashboard", { 
        state: { 
          continueAssessment: true, 
          assessmentId: assessment.id 
        } 
      });
    } else if (assessment.status === "completed") {
      navigate("/dashboard", {
        replace: true,
        state: {
          showConfirmation: true,
          subscription: {
            medication: assessment.medication,
            plan_type: assessment.plan_type,
            amount: assessment.amount
          }
        }
      });
    } else {
      setSelectedAssessment(assessment);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Assessments</h2>
        <Button onClick={startNewAssessment}>Start New Assessment</Button>
      </div>
      
      {assessments && assessments.length > 0 ? (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onViewAssessment={handleViewAssessment}
            />
          ))}
        </div>
      ) : (
        <EmptyAssessmentState onStartAssessment={startNewAssessment} />
      )}

      <CompletedAssessmentModal
        assessment={selectedAssessment}
        open={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
      />
    </div>
  );
};