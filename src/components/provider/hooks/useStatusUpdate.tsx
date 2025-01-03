import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Assessment } from "../types"
import { useQueryClient } from "@tanstack/react-query"

export const useStatusUpdate = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleStatusUpdate = async (
    assessmentId: string, 
    newStatus: "prescribed" | "denied" | "completed", 
    denialReason?: string
  ) => {
    try {
      console.log("Starting status update:", { assessmentId, newStatus, denialReason })
      
      const { data: assessment, error: fetchError } = await supabase
        .from("assessments")
        .select("*, profiles(email)")
        .eq("id", assessmentId)
        .maybeSingle()

      if (fetchError) {
        console.error("Error fetching assessment:", fetchError)
        throw new Error("Failed to fetch assessment")
      }

      if (!assessment) {
        console.error("Assessment not found with ID:", assessmentId)
        throw new Error("Assessment not found or no longer exists")
      }

      console.log("Found assessment:", assessment)

      const updateData: any = { 
        status: newStatus,
        denial_reason: newStatus === "completed" ? null : (denialReason || assessment.denial_reason)
      }

      console.log("Updating assessment with data:", updateData)

      const { error: updateError } = await supabase
        .from("assessments")
        .update(updateData)
        .eq("id", assessmentId)

      if (updateError) {
        console.error("Supabase update error:", updateError)
        throw updateError
      }

      console.log("Status updated successfully")

      // Invalidate and refetch queries to update UI
      await queryClient.invalidateQueries({ queryKey: ["provider-assessments"] })

      if ((newStatus === "prescribed" || newStatus === "denied") && assessment.profiles?.email) {
        console.log('Sending email to:', assessment.profiles.email)
        const { error: emailError } = await supabase.functions.invoke('send-status-email', {
          body: {
            to: assessment.profiles.email,
            status: newStatus,
            denialReason: denialReason || "No reason provided",
            medication: assessment.medication
          }
        })

        if (emailError) {
          console.error("Error sending email:", emailError)
          toast({
            title: "Warning",
            description: "Status updated but failed to send email notification",
            variant: "destructive",
          })
        } else {
          console.log('Email sent successfully')
        }
      }

      toast({
        title: "Success",
        description: `Assessment has been ${newStatus}`,
      })
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update assessment status",
        variant: "destructive",
      })
      throw error
    }
  }

  return { handleStatusUpdate }
}
