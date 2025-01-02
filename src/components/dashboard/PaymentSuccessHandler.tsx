import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentSuccessHandlerProps {
  formData: any;
  onSuccess: (assessment: any) => void;
}

export const usePaymentSuccess = ({ formData, onSuccess }: PaymentSuccessHandlerProps) => {
  const { toast } = useToast();

  const handlePaymentSuccess = async (assessmentId: string) => {
    try {
      // Update the assessment with shipping information
      const { error: updateError } = await supabase
        .from('assessments')
        .update({
          shipping_address: formData.shippingAddress,
          shipping_city: formData.shippingCity,
          shipping_state: formData.shippingState,
          shipping_zip: formData.shippingZip,
          status: 'active'
        })
        .eq('id', assessmentId);

      if (updateError) {
        console.error('Error updating shipping info:', updateError);
        toast({
          title: "Error",
          description: "Failed to save shipping information. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) {
        console.error('Error fetching assessment:', error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        });
        return;
      }

      onSuccess(assessment);
    } catch (error) {
      console.error('Error in handlePaymentSuccess:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handlePaymentSuccess };
};