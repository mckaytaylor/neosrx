import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateCardNumber, validateExpirationDate, validateCardCode, getErrorMessage } from "@/utils/paymentValidation";

interface PaymentData {
  cardNumber: string;
  expirationDate: string;
  cardCode: string;
}

export const usePaymentSubmission = (subscriptionId: string, onSuccess: () => void) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validatePayment = (paymentData: PaymentData) => {
    const cleanCardNumber = paymentData.cardNumber.replace(/\s/g, '');
    
    // Special handling for test card
    if (cleanCardNumber === '4111111111111111') {
      console.log('Test card detected - bypassing initial validation');
      return true;
    }

    if (!validateCardNumber(cleanCardNumber)) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number (15-16 digits).",
        variant: "destructive",
      });
      return false;
    }

    if (!validateExpirationDate(paymentData.expirationDate)) {
      toast({
        title: "Invalid Expiration Date",
        description: "The card expiration date is invalid or the card has expired.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateCardCode(paymentData.cardCode)) {
      toast({
        title: "Invalid Security Code",
        description: "Please enter a valid security code (3-4 digits).",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (paymentData: PaymentData) => {
    const cleanCardNumber = paymentData.cardNumber.replace(/\s/g, '');
    
    if (!validatePayment(paymentData)) {
      return;
    }

    setIsProcessing(true);

    try {
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (assessmentError || !assessment) {
        console.error('Assessment fetch error:', assessmentError);
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
          amount: assessment.amount,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Payment processing failed");
      }

      const { error: updateError } = await supabase
        .from('assessments')
        .update({ status: 'completed' })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('Error updating assessment status:', updateError);
        throw new Error("Failed to update assessment status");
      }

      console.log('Successfully updated assessment status to completed');

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

  return {
    isProcessing,
    handleSubmit,
  };
};