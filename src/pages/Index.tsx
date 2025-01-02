import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Listen for auth state changes, including email confirmation
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now proceed.",
      });
      navigate("/dashboard"); // Redirect to dashboard or appropriate page
    }
  });

  const handleStart = () => {
    setShowAuth(true);
  };

  const handleAuthSubmit = async (data: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string 
  }) => {
    if (isSubmitting) {
      toast({
        title: "Please wait",
        description: "You can only make one request every 45 seconds.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (authMode === "register") {
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

        if (signUpError) {
          if (signUpError.message.includes('rate_limit')) {
            throw new Error("Please wait 45 seconds before trying again.");
          }
          throw signUpError;
        }

        if (!signUpData.user) {
          throw new Error("Failed to create user account.");
        }

        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!sessionData.session) {
          // Instead of throwing an error, show the verification alert
          setUserEmail(data.email);
          setShowVerificationAlert(true);
          return;
        }

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
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 45000);
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
            {showVerificationAlert && (
              <Alert>
                <AlertDescription className="space-y-3">
                  <p>We've sent a verification email to <strong>{userEmail}</strong></p>
                  <p>Please check your inbox and click the verification link to complete your registration. The verification link will redirect you back to the application.</p>
                  <p>Don't see the email? Check your spam folder or request a new verification email.</p>
                </AlertDescription>
              </Alert>
            )}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-secondary mb-6 text-center">
                {authMode === "login" ? "Welcome Back" : "Create Your Account"}
              </h2>
              <AuthForm
                mode={authMode}
                onSubmit={handleAuthSubmit}
                onToggleMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;