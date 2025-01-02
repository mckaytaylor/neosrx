import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { LogOut, Loader } from "lucide-react"
import { AssessmentsTable } from "./provider/AssessmentsTable"
import { EmptyState } from "./provider/EmptyState"
import { Assessment } from "./provider/types"
import { useEffect, useState } from "react"

const ProviderDashboard = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [authChecked, setAuthChecked] = useState(false)
  const [isProvider, setIsProvider] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true;

    const checkProviderAccess = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError;

        if (!user && mounted) {
          console.log("No user found, redirecting to login")
          setIsProvider(false)
          setAuthChecked(true)
          navigate("/provider-login", { replace: true })
          return
        }

        // Add debug logging
        console.log("User metadata:", {
          role: user.app_metadata?.role,
          is_provider: user.app_metadata?.is_provider,
          user_id: user.id,
          app_metadata: user.app_metadata
        })

        const isProviderUser = user.app_metadata?.is_provider === true

        if (mounted) {
          setIsProvider(isProviderUser)
          setAuthChecked(true)

          if (!isProviderUser) {
            console.log("User is not a provider, redirecting to login")
            toast({
              title: "Unauthorized",
              description: "You don't have access to the provider dashboard.",
              variant: "destructive",
            })
            navigate("/provider-login", { replace: true })
          }
        }
      } catch (error) {
        console.error("Error checking provider access:", error)
        if (mounted) {
          setIsProvider(false)
          setAuthChecked(true)
          navigate("/provider-login", { replace: true })
        }
      }
    }

    if (!authChecked) {
      checkProviderAccess()
    }

    return () => {
      mounted = false
    }
  }, [navigate, toast, authChecked])

  const fetchAssessments = async () => {
    console.log("Starting fetchAssessments")
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("No authenticated user found")
      throw new Error("No authenticated user")
    }

    console.log("Fetching assessments for user:", user.id)

    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*, profiles(first_name, last_name)")
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching assessments:", error)
        throw error
      }

      console.log("Successfully fetched assessments:", data)
      return data as Assessment[]
    } catch (error) {
      console.error("Error in fetchAssessments:", error)
      throw error
    }
  }

  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ["provider-assessments"],
    queryFn: fetchAssessments,
    enabled: isProvider === true && authChecked,
  })

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
        <AssessmentsTable assessments={assessments} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default ProviderDashboard