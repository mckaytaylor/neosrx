import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const ProviderLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error("No user found")

      const isProvider = user.app_metadata?.is_provider === true && 
                        user.role === "provider"

      if (!isProvider) {
        await supabase.auth.signOut()
        throw new Error("Unauthorized access")
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
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ProviderLogin