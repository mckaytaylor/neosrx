import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentForm } from "@/components/PaymentForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PaymentStepProps {
  subscriptionId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const PaymentStep = ({ subscriptionId, onSuccess, onBack }: PaymentStepProps) => {
  if (!subscriptionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              There was an error loading your assessment details. Please go back and try again.
            </AlertDescription>
          </Alert>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
      </CardHeader>
      <CardContent>
        <PaymentForm
          subscriptionId={subscriptionId}
          onSuccess={onSuccess}
          onCancel={onBack}
        />
      </CardContent>
    </Card>
  );
};