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

  // Check for email confirmation success
  const params = new URLSearchParams(window.location.search);
  const confirmationError = params.get('error_description');
  const confirmationType = params.get('type');
  const accessToken = params.get('access_token');
  
  // Handle automatic login after email confirmation
  if (accessToken && confirmationType === 'signup') {
    // Set the session in Supabase
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: params.get('refresh_token') || '',
    }).then(() => {
      toast({
        title: "Success",
        description: "Your email has been confirmed! Redirecting to dashboard...",
      });
      navigate("/dashboard");
    }).catch((error) => {
      console.error("Session error:", error);
      toast({
        title: "Error",
        description: "Failed to set session. Please try logging in manually.",
        variant: "destructive",
      });
    });
  } else if (confirmationError) {
    toast({
      title: "Error",
      description: decodeURIComponent(confirmationError),
      variant: "destructive",
    });
  }

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          throw new Error("Please verify your email before logging in.");
        }
        throw new Error("Invalid email or password.");
      }

      // After successful login, check if user is a provider
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user data found");
      }

      const isProvider = user.app_metadata?.role === 'provider';
      
      if (!isProvider) {
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
        description: error.message,
        variant: "destructive",
      });
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
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'provider',
            provider: true,
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: `${window.location.origin}/provider-login`
        }
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error("Registration failed. Please try again.");
      }

      // Sign out after registration
      await supabase.auth.signOut();

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account before logging in.",
      });

      setMode("login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
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