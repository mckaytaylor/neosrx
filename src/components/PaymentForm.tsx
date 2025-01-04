import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

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
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    
    // Add spaces for readability
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    const formattedValue = parts.join(' ');
    
    setPaymentData({ ...paymentData, cardNumber: formattedValue });
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
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
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    setPaymentData({ ...paymentData, cardCode: value });
  };

  const validateExpirationDate = (expDate: string): boolean => {
    const [month, year] = expDate.split('/');
    if (!month || !year) return false;

    const currentDate = new Date();
    const expiration = new Date(parseInt(`20${year}`), parseInt(month) - 1);
    return expiration > currentDate;
  };

  const validateCardNumber = (cardNumber: string): boolean => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length >= 15 && cleanNumber.length <= 16;
  };

  const validateCardCode = (code: string): boolean => {
    return code.length >= 3 && code.length <= 4;
  };

  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('card number format')) {
      return 'Please enter a valid card number (15-16 digits).';
    }
    if (errorMessage.includes('expired')) {
      return 'This card has expired. Please use a different card.';
    }
    if (errorMessage.includes('declined')) {
      return 'Your card was declined. Please check your card details or try a different card.';
    }
    if (errorMessage.includes('invalid')) {
      return 'The card information provided is invalid. Please check and try again.';
    }
    if (errorMessage.includes('cvv') || errorMessage.includes('security code')) {
      return 'Invalid security code (CVV). Please check and try again.';
    }
    
    return 'There was a problem processing your payment. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateCardNumber(paymentData.cardNumber)) {
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

    setIsProcessing(true);

    try {
      // First, verify the assessment exists and has a valid amount
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (assessmentError || !assessment) {
        throw new Error("Assessment not found");
      }

      if (!assessment.amount || assessment.amount <= 0) {
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
            cardNumber: paymentData.cardNumber.replace(/\s/g, ''), // Remove spaces before sending
          },
          subscriptionId,
        },
      });

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
      <div>
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={paymentData.cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19} // 16 digits + 3 spaces
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationDate">Expiration Date (MM/YY)</Label>
        <Input
          id="expirationDate"
          placeholder="MM/YY"
          value={paymentData.expirationDate}
          onChange={handleExpirationDateChange}
          maxLength={5}
          required
        />
      </div>
      <div>
        <Label htmlFor="cardCode">CVV</Label>
        <Input
          id="cardCode"
          placeholder="123"
          value={paymentData.cardCode}
          onChange={handleCardCodeChange}
          maxLength={4}
          required
        />
      </div>
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