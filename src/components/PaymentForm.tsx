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

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    
    if (value.length >= 2) {
      const month = value.slice(0, 2);
      const year = value.slice(2);
      value = `${month}/${year}`;
    }

    setPaymentData({ ...paymentData, expirationDate: value });
  };

  const validateExpirationDate = (expDate: string): boolean => {
    const [month, year] = expDate.split('/');
    if (!month || !year) return false;

    const currentDate = new Date();
    const expiration = new Date(parseInt(`20${year}`), parseInt(month) - 1);
    return expiration > currentDate;
  };

  const getErrorMessage = (error: any): string => {
    // Check for specific error messages from the payment processor
    const errorMessage = error?.message?.toLowerCase() || '';
    
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
    
    // Default error message
    return 'There was a problem processing your payment. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate expiration date before processing
    if (!validateExpirationDate(paymentData.expirationDate)) {
      toast({
        title: "Invalid Expiration Date",
        description: "The card expiration date is invalid or the card has expired.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const response = await supabase.functions.invoke('process-payment', {
        body: {
          paymentData,
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
          onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationDate">Expiration Date (MM/YYYY)</Label>
        <Input
          id="expirationDate"
          placeholder="MM/YYYY"
          value={paymentData.expirationDate}
          onChange={handleExpirationDateChange}
          maxLength={7}
          required
        />
      </div>
      <div>
        <Label htmlFor="cardCode">CVV</Label>
        <Input
          id="cardCode"
          placeholder="123"
          value={paymentData.cardCode}
          onChange={(e) => setPaymentData({ ...paymentData, cardCode: e.target.value })}
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