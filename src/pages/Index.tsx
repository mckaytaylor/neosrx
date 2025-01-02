import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStart = () => {
    setShowAuth(true);
  };

  const handleAuthSubmit = async (data: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string 
  }) => {
    try {
      if (authMode === "register") {
        // First, sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Get the current session to ensure we have authentication
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            // Now create the profile with the authenticated session
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: signUpData.user.id,
                first_name: data.firstName,
                last_name: data.lastName,
              });

            if (profileError) throw profileError;

            toast({
              title: "Account created",
              description: "Please check your email to verify your account.",
            });
          } else {
            throw new Error("Session not established. Please try logging in.");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {!showAuth ? (
          <div className="text-center space-y-8 py-20">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary">
              GLP-1 Medication Assessment
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete our comprehensive assessment to determine if GLP-1 medications like Semaglutide or Tirzepatide are right for you.
            </p>
            <Button 
              size="lg"
              onClick={handleStart}
              className="mt-8"
            >
              Start Assessment
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-8">
            <ProgressBar currentStep={1} totalSteps={7} className="mb-8" />
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-secondary mb-6 text-center">
                {authMode === "login" ? "Welcome Back" : "Create Your Account"}
              </h2>
              <AuthForm
                mode={authMode}
                onSubmit={handleAuthSubmit}
                onToggleMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;