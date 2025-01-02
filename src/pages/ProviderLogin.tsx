import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const ProviderLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check if user is already logged in as provider
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const isProvider = session.user.app_metadata?.is_provider === true && 
                         session.user.role === 'provider'
        if (isProvider) {
          navigate("/provider/dashboard")
        }
      }
    }
    
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isProvider = session.user.app_metadata?.is_provider === true && 
                         session.user.role === 'provider'
        if (isProvider) {
          navigate("/provider/dashboard")
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const user = data.user
      console.log("User metadata:", user.app_metadata)
      console.log("User role:", user.role)

      // Check both is_provider flag and role
      const isProvider = user?.app_metadata?.is_provider === true && 
                        user?.role === 'provider'

      if (!isProvider) {
        await supabase.auth.signOut()
        throw new Error("Unauthorized access. This login is for providers only.")
      }

      toast({
        title: "Success",
        description: "Successfully logged in as provider",
      })
      
      navigate("/provider/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md mt-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Provider Login</h1>
          <p className="text-gray-500">Please sign in with your provider account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ProviderLogin