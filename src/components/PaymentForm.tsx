import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PaymentFormFields } from "./PaymentFormFields";
import { validateCardNumber, validateExpirationDate, validateCardCode, getErrorMessage } from "@/utils/paymentValidation";

interface PaymentFormProps {
  subscriptionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm = ({ subscriptionId, onSuccess, onCancel }: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expirationDate: "",
    cardCode: "",
  });

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    const formattedValue = parts.join(' ');
    setPaymentData({ ...paymentData, cardNumber: formattedValue });
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    if (value.length >= 2) {
      const month = value.slice(0, 2);
      const year = value.slice(2);
      value = `${month}/${year}`;
    }
    setPaymentData({ ...paymentData, expirationDate: value });
  };

  const handleCardCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    setPaymentData({ ...paymentData, cardCode: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCardNumber = paymentData.cardNumber.replace(/\s/g, '');
    console.log('Processing payment with card number:', {
      length: cleanCardNumber.length,
      isTestCard: cleanCardNumber === '4111111111111111'
    });

    // Special handling for test card
    if (cleanCardNumber === '4111111111111111') {
      console.log('Test card detected - bypassing initial validation');
    } else {
      if (!validateCardNumber(cleanCardNumber)) {
        toast({
          title: "Invalid Card Number",
          description: "Please enter a valid card number (15-16 digits).",
          variant: "destructive",
        });
        return;
      }

      if (!validateExpirationDate(paymentData.expirationDate)) {
        toast({
          title: "Invalid Expiration Date",
          description: "The card expiration date is invalid or the card has expired.",
          variant: "destructive",
        });
        return;
      }

      if (!validateCardCode(paymentData.cardCode)) {
        toast({
          title: "Invalid Security Code",
          description: "Please enter a valid security code (3-4 digits).",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (assessmentError) {
        console.error('Assessment fetch error:', assessmentError);
        throw new Error("Assessment not found");
      }

      if (!assessment) {
        console.error('Assessment not found');
        throw new Error("Assessment not found");
      }

      if (!assessment.amount || assessment.amount <= 0) {
        console.error('Invalid assessment amount:', assessment);
        throw new Error("Invalid assessment amount");
      }

      console.log('Processing payment for assessment:', {
        id: assessment.id,
        amount: assessment.amount,
        plan: assessment.plan_type,
        medication: assessment.medication
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const response = await supabase.functions.invoke('process-payment', {
        body: {
          paymentData: {
            ...paymentData,
            cardNumber: cleanCardNumber,
          },
          subscriptionId,
          amount: assessment.amount, // Explicitly pass the amount
        },
      });

      console.log('Payment response:', response);

      if (response.error) {
        throw new Error(response.error.message || "Payment processing failed");
      }

      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated.",
      });
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentFormFields
        paymentData={paymentData}
        handleCardNumberChange={handleCardNumberChange}
        handleExpirationDateChange={handleExpirationDateChange}
        handleCardCodeChange={handleCardCodeChange}
      />
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