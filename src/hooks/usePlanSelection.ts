import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateAmount } from "@/utils/pricingUtils";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

  const handlePlanSelect = async (plan: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const medication = formData.selectedMedication?.toLowerCase();
      const amount = calculateAmount(medication, plan);
      
      if (!amount) {
        console.error('Invalid plan or medication selected:', { medication, plan });
        toast({
          title: "Error",
          description: "Invalid plan or medication selected",
          variant: "destructive",
        });
        return;
      }

      console.log('Selected plan pricing:', { medication, plan, amount });

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();

      if (existingDraft) {
        console.log('Updating existing draft:', { 
          id: existingDraft.id,
          medication,
          plan,
          amount 
        });

        const { data, error } = await supabase
          .from('assessments')
          .update({
            medication,
            plan_type: plan,
            amount
          })
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        console.log('Successfully updated draft assessment:', data);
        onSuccess(plan, data.id);
      } else {
        console.log('Creating new assessment:', { 
          medication,
          plan,
          amount 
        });

        const { data, error } = await supabase
          .from('assessments')
          .insert({
            user_id: user.id,
            medication,
            plan_type: plan,
            amount,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;
        console.log('Successfully created new assessment:', data);
        onSuccess(plan, data.id);
      }
    } catch (error: any) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handlePlanSelect };
};