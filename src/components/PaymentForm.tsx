import { PaymentProvider } from "./payment/PaymentFormProvider";
import { usePaymentContext } from "./payment/PaymentFormContext";
import { usePaymentSubmission } from "./payment/usePaymentSubmission";
import { Button } from "@/components/ui/button";
import { PaymentFormFields } from "./PaymentFormFields";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentFormProps {
  subscriptionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentFormContent = ({ subscriptionId, onSuccess, onCancel }: PaymentFormProps) => {
  const { paymentData } = usePaymentContext();
  const { isProcessing, handleSubmit } = usePaymentSubmission(subscriptionId, onSuccess);
  const queryClient = useQueryClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(paymentData);
    // Invalidate queries to refresh assessment data
    await queryClient.invalidateQueries({ queryKey: ["user-assessments"] });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentFormFields />
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};

export const PaymentForm = (props: PaymentFormProps) => {
  return (
    <PaymentProvider>
      <PaymentFormContent {...props} />
    </PaymentProvider>
  );
};