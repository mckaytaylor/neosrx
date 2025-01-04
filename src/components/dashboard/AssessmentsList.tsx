import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CompletedAssessmentModal } from "./CompletedAssessmentModal";
import { useToast } from "@/hooks/use-toast";

export const AssessmentsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      console.log("Fetched assessments:", data); // Debug log
      return data;
    },
  });

  const startNewAssessment = async () => {
    // Check if there's an existing draft
    const existingDraft = assessments?.find(assessment => assessment.status === "draft");
    
    if (existingDraft) {
      // If there's an existing draft, navigate to it
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
      // Check if there's at least one completed assessment
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

      // If no draft exists and either there are no assessments or there's a completed one,
      // start a new assessment
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
      // If the assessment is completed, show the confirmation screen
      navigate("/dashboard", {
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

  // Debug log to check assessments data
  console.log("Current assessments:", assessments?.map(a => ({ id: a.id, status: a.status })));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Assessments</h2>
        <Button onClick={startNewAssessment}>Start New Assessment</Button>
      </div>
      
      {assessments && assessments.length > 0 ? (
        <div className="grid gap-4">
          {assessments.map((assessment) => (
            <Card 
              key={assessment.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleViewAssessment(assessment)}
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  Assessment from {format(new Date(assessment.created_at), "PPP")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{assessment.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medication:</span>
                    <span className="font-medium capitalize">{assessment.medication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{assessment.plan_type}</span>
                  </div>
                  {assessment.status === "draft" && (
                    <Button 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/dashboard", { 
                          state: { 
                            continueAssessment: true, 
                            assessmentId: assessment.id 
                          } 
                        });
                      }}
                    >
                      Continue Assessment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No assessments found. Start your first assessment now!</p>
            <Button onClick={startNewAssessment} className="mt-4">
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      <CompletedAssessmentModal
        assessment={selectedAssessment}
        open={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
      />
    </div>
  );
};