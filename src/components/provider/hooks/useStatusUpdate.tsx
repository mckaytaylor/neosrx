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
      
      const { data: assessment } = await supabase
        .from("assessments")
        .select("*, profiles(email)")
        .eq("id", assessmentId)
        .single()

      if (!assessment) {
        throw new Error("Assessment not found")
      }

      console.log("Found assessment:", assessment)

      const updateData: any = { status: newStatus }
      if (denialReason) {
        updateData.denial_reason = denialReason
      }

      console.log("Updating assessment with data:", updateData)

      const { error } = await supabase
        .from("assessments")
        .update(updateData)
        .eq("id", assessmentId)

      if (error) {
        console.error("Supabase update error:", error)
        throw error
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
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update assessment status",
        variant: "destructive",
      })
      throw error
    }
  }

  return { handleStatusUpdate }
}