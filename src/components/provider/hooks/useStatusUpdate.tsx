import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Assessment } from "../types"

export const useStatusUpdate = () => {
  const { toast } = useToast()

  const handleStatusUpdate = async (
    assessmentId: string, 
    newStatus: "prescribed" | "denied" | "completed", 
    denialReason?: string
  ) => {
    try {
      const { data: assessment } = await supabase
        .from("assessments")
        .select("*, profiles(email)")
        .eq("id", assessmentId)
        .single()

      if (!assessment) {
        throw new Error("Assessment not found")
      }

      const updateData: any = { status: newStatus }
      if (denialReason) {
        updateData.denial_reason = denialReason
      }

      const { error } = await supabase
        .from("assessments")
        .update(updateData)
        .eq("id", assessmentId)

      if (error) throw error

      // Send email notification if we have an email and the status is prescribed or denied
      if ((newStatus === "prescribed" || newStatus === "denied") && assessment.profiles?.email) {
        console.log('Sending email to:', assessment.profiles.email)
        const { error: emailError } = await supabase.functions.invoke('send-status-email', {
          body: {
            to: assessment.profiles.email,
            status: newStatus,
            denialReason: denialReason,
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
      } else {
        console.log('No email found for user or status does not require email notification')
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
    }
  }

  return { handleStatusUpdate }
}