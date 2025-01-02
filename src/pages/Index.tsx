import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/landing/Hero";
import { AuthSection } from "@/components/landing/AuthSection";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now proceed.",
      });
      navigate("/dashboard");
    }
  });

  const handleStart = () => {
    setShowAuth(true);
    setAuthMode("register");
  };

  const handleLoginClick = () => {
    setShowAuth(true);
    setAuthMode("login");
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

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!sessionData.session) {
          setUserEmail(data.email);
          setShowVerificationAlert(true);
          return;
        }

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
    <div className="min-h-screen bg-gradient-to-br from-white to-[#8BA89F]/5">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {!showAuth ? (
          <Hero onStart={handleStart} onLogin={handleLoginClick} />
        ) : (
          <AuthSection
            showVerificationAlert={showVerificationAlert}
            userEmail={userEmail}
            isSubmitting={isSubmitting}
            authMode={authMode}
            onSubmit={handleAuthSubmit}
            onToggleMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
          />
        )}
      </div>
    </div>
  );
};

export default Index;