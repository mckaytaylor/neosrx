import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { LogOut, Loader } from "lucide-react"
import { EmptyState } from "./provider/EmptyState"
import { StatusTabs } from "./provider/StatusTabs"
import { useAuthCheck } from "./provider/hooks/useAuthCheck"
import { useAssessments } from "./provider/hooks/useAssessments"
import { useStatusUpdate } from "./provider/hooks/useStatusUpdate"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

const ProviderDashboard = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { authChecked, isProvider } = useAuthCheck()
  const { assessments, isLoading, error } = useAssessments(isProvider, authChecked)
  const { handleStatusUpdate } = useStatusUpdate()
  const queryClient = useQueryClient()

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