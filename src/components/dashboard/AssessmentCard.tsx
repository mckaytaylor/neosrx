import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface AssessmentCardProps {
  assessment: any;
  onViewAssessment: (assessment: any) => void;
}

export const AssessmentCard = ({ assessment, onViewAssessment }: AssessmentCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      key={assessment.id}
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onViewAssessment(assessment)}
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
  );
};