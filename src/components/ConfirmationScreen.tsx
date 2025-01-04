import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConfirmationHeader } from "./confirmation/ConfirmationHeader";
import { OrderSummary } from "./confirmation/OrderSummary";
import { useConfirmationStatus } from "./confirmation/useConfirmationStatus";

interface ConfirmationScreenProps {
  subscription: {
    id: string;
    medication: string;
    plan_type: string;
    amount: number;
    status: string;
  };
}

export const ConfirmationScreen = ({ subscription }: ConfirmationScreenProps) => {
  const navigate = useNavigate();
  useConfirmationStatus(subscription);

  const handleReturnToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  if (!subscription) {
    return (
      <div className="text-center">
        <p className="text-red-500">Error loading order details. Please contact support if this persists.</p>
        <Button
          variant="link"
          onClick={handleReturnToDashboard}
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmationHeader medication={subscription.medication} />
      <OrderSummary 
        medication={subscription.medication}
        planType={subscription.plan_type}
        amount={subscription.amount}
      />
      <div className="text-center">
        <Button
          variant="link"
          onClick={handleReturnToDashboard}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};