import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProviderLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      console.log("Attempting provider login...");
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        // Check for specific error messages
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Please check your email and confirm your account before logging in.");
        }
        throw signInError;
      }

      if (!user) {
        console.error("No user data returned");
        throw new Error("No user returned after login");
      }

      // Fetch the user's metadata
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

      // Check if the user has the provider role
      const isProvider = userData.app_metadata?.role === 'provider';

      if (!isProvider) {
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
        description: error.message || "Invalid login credentials",
        variant: "destructive",
      });
      // Sign out if there was an error
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async ({ 
    email, 
    password,
    firstName,
    lastName 
  }: { 
    email: string; 
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      
      console.log("Attempting provider registration...");
      
      // Sign up the user with provider metadata
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'provider',
            provider: true,
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (signUpError) {
        console.error("Sign up error:", signUpError);
        throw signUpError;
      }

      if (!user) {
        throw new Error("No user returned after registration");
      }

      // Sign out after registration to ensure email verification
      await supabase.auth.signOut();

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account before logging in.",
      });

      // Switch back to login mode
      setMode("login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during registration",
        variant: "destructive",
      });
      // Ensure user is signed out if there was an error
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
            {mode === "login" ? "Provider Login" : "Provider Registration"}
          </h2>
          <AuthForm
            mode={mode}
            onSubmit={mode === "login" ? handleLogin : handleRegister}
            onToggleMode={() => setMode(mode === "login" ? "register" : "login")}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;