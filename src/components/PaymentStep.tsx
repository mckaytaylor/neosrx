import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentForm } from "@/components/PaymentForm";

interface PaymentStepProps {
  subscriptionId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const PaymentStep = ({ subscriptionId, onSuccess, onBack }: PaymentStepProps) => {
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