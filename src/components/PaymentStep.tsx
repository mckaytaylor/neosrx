import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentForm } from "@/components/PaymentForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

interface PaymentStepProps {
  subscriptionId: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const PaymentStep = ({ subscriptionId, onSuccess, onBack }: PaymentStepProps) => {
  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ["assessment", subscriptionId],
    queryFn: async () => {
      console.log("Fetching assessment with ID:", subscriptionId);
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", subscriptionId)
        .single();

      if (error) {
        console.error("Error fetching assessment:", error);
        throw error;
      }

      console.log("Fetched assessment:", data);
      return data;
    },
    enabled: !!subscriptionId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !assessment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <p className="text-destructive">Error loading assessment details</p>
          <button
            onClick={onBack}
            className="text-primary hover:underline"
          >
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

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