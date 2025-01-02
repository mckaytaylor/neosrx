import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AssessmentsList = () => {
  const navigate = useNavigate();
  
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
      return data;
    },
  });

  const startNewAssessment = () => {
    navigate("/dashboard", { state: { startNew: true } });
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
            <Card key={assessment.id}>
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
                    <span className="font-medium">{assessment.medication}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{assessment.plan_type}</span>
                  </div>
                  {assessment.status === "pending" && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/dashboard", { 
                        state: { 
                          continueAssessment: true, 
                          assessmentId: assessment.id 
                        } 
                      })}
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
    </div>
  );
};