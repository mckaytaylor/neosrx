import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { LogOut, Loader } from "lucide-react"
import { EmptyState } from "./provider/EmptyState"
import { Assessment } from "./provider/types"
import { useEffect, useState } from "react"
import { StatusTabs } from "./provider/StatusTabs"

const ProviderDashboard = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [authChecked, setAuthChecked] = useState(false)
  const [isProvider, setIsProvider] = useState<boolean | null>(null)

  useEffect(() => {
    const checkProviderAccess = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError;

        if (!user) {
          console.log("No user found, redirecting to login")
          setIsProvider(false)
          setAuthChecked(true)
          navigate("/provider-login", { replace: true })
          return
        }

        const isProviderUser = user.app_metadata?.is_provider === true

        if (!isProviderUser) {
          console.log("User is not a provider, redirecting to login")
          toast({
            title: "Unauthorized",
            description: "You don't have access to the provider dashboard.",
            variant: "destructive",
          })
          navigate("/provider-login", { replace: true })
        }

        setIsProvider(isProviderUser)
        setAuthChecked(true)
      } catch (error) {
        console.error("Error checking provider access:", error)
        setIsProvider(false)
        setAuthChecked(true)
        navigate("/provider-login", { replace: true })
      }
    }

    if (!authChecked) {
      checkProviderAccess()
    }
  }, [navigate, toast, authChecked])

  useEffect(() => {
    const channel = supabase
      .channel('assessment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessments'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["provider-assessments"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ["provider-assessments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No authenticated user")

      const { data, error } = await supabase
        .from("assessments")
        .select("*, profiles(first_name, last_name, email)")
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Assessment[]
    },
    enabled: isProvider === true && authChecked,
  })

  const handleStatusUpdate = async (assessmentId: string, newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => {
    try {
      const assessment = assessments?.find(a => a.id === assessmentId)
      if (!assessment) return

      const updateData: any = { status: newStatus }
      if (denialReason) {
        updateData.denial_reason = denialReason
      }

      const { error } = await supabase
        .from("assessments")
        .update(updateData)
        .eq("id", assessmentId)

      if (error) throw error

      // Send email notification
      if (newStatus === "prescribed" || newStatus === "denied") {
        const { error: emailError } = await supabase.functions.invoke('send-status-email', {
          body: {
            to: assessment.profiles?.email,
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
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      navigate("/provider-login", { replace: true })
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!authChecked) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="text-destructive mb-4">Error loading assessments</div>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["provider-assessments"] })}>
            Try Again
          </Button>
        </div>
      ) : assessments && assessments.length > 0 ? (
        <StatusTabs 
          assessments={assessments} 
          onStatusUpdate={handleStatusUpdate}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default ProviderDashboard
