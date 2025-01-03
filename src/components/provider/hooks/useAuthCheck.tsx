import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const useAuthCheck = () => {
  const { toast } = useToast()
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

  return { authChecked, isProvider }
}