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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      toast({
        title: "Success",
        description: "You have been successfully signed in.",
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

  const handleResetPassword = async (email: string) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      setShowResetPassword(false);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Error",
        description: "Unable to send reset password email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthSubmit = async (data: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string 
  }) => {
    if (isSubmitting) return;

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
          if (signUpError.message.includes('User already registered')) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            return;
          }
          throw signUpError;
        }

        if (!signUpData.user) {
          throw new Error("Failed to create account");
        }

        setUserEmail(data.email);
        setShowVerificationAlert(true);
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          
          if (signInError.message.includes('Invalid login credentials') || 
              signInError.message.includes('Email not confirmed')) {
            toast({
              title: "Login Failed",
              description: "Incorrect email or password. Please try again or reset your password.",
              variant: "destructive",
            });
            return;
          }

          throw signInError;
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            onResetPassword={handleResetPassword}
            showResetPassword={showResetPassword}
            onToggleResetPassword={() => setShowResetPassword(!showResetPassword)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;