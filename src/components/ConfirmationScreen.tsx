import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfirmationScreenProps {
  subscription: {
    medication: string;
    plan_type: string;
    amount: number;
  };
}

export const ConfirmationScreen = ({ subscription }: ConfirmationScreenProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Payment Successful",
      description: "Your order has been confirmed.",
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Thank You for Your Order!</h2>
        <p className="text-muted-foreground">
          We're processing your prescription request.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Medication:</span>
            <span className="font-medium">{subscription.medication}</span>
            
            <span className="text-muted-foreground">Plan:</span>
            <span className="font-medium">{subscription.plan_type}</span>
            
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">${subscription.amount}</span>
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <h4 className="font-medium">What's Next?</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Our medical provider will review your information within 24-48 hours</li>
              <li>You'll receive an email confirmation once your prescription is approved</li>
              <li>Your medication will be shipped directly to your address</li>
              <li>Track your order status in your dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-primary hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};