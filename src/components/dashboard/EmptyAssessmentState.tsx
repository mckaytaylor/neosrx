import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyAssessmentStateProps {
  onStartAssessment: () => void;
}

export const EmptyAssessmentState = ({ onStartAssessment }: EmptyAssessmentStateProps) => {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">No assessments found. Start your first assessment now!</p>
        <Button onClick={onStartAssessment} className="mt-4">
          Start Assessment
        </Button>
      </CardContent>
    </Card>
  );
};