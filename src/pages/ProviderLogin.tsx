import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ProviderLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      console.log("Attempting provider login...");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        throw signInError;
      }

      if (!data.user) {
        console.error("No user data returned");
        throw new Error("No user returned after login");
      }

      console.log("User signed in successfully:", data.user.id);
      console.log("User metadata:", data.user.app_metadata);

      // Fetch the user's metadata to check if they're a provider
      const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }

      if (!userData) {
        console.error("No user data found");
        throw new Error("No user data found");
      }

      console.log("User role:", userData.app_metadata?.role);
      console.log("Is provider:", userData.app_metadata?.provider);

      // Check if the user has the provider role in their metadata
      const isProvider = userData.app_metadata?.role === 'provider';

      if (!isProvider) {
        // If not a provider, sign them out and show error
        console.error("User is not a provider");
        await supabase.auth.signOut();
        throw new Error("Unauthorized access. Provider accounts only.");
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in as provider.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      // Sign out if there was an error
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#8BA89F]/5 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-[#8BA89F]/10">
          <h2 className="text-2xl font-semibold text-[#8BA89F] mb-6 text-center">
            Provider Login
          </h2>
          <AuthForm
            mode="login"
            onSubmit={handleLogin}
            onToggleMode={() => {}} // Providers can't register through the UI
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;