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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            paymentData,
            subscriptionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment processing failed");
      }

      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
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
          placeholder="12/2025"
          value={paymentData.expirationDate}
          onChange={(e) => setPaymentData({ ...paymentData, expirationDate: e.target.value })}
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