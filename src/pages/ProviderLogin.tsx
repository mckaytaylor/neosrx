import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";

const ProviderLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.app_metadata?.is_provider) {
        toast({
          title: "Access Denied",
          description: "You don't have provider access.",
          variant: "destructive",
        });
        return;
      }

      navigate("/provider/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link.",
      });
      setShowResetPassword(false);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset link.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#8BA89F]/5">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-[#8BA89F] text-[#8BA89F] hover:bg-[#8BA89F]/10"
          >
            Logout
          </Button>
        </div>
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-[#8BA89F]/10">
            <h2 className="text-2xl font-semibold text-[#8BA89F] mb-6 text-center">
              Provider Login
            </h2>
            <AuthForm
              mode="login"
              onSubmit={handleSubmit}
              onToggleMode={() => {}}
              disabled={isSubmitting}
              onResetPassword={handleResetPassword}
              showResetPassword={showResetPassword}
              onToggleResetPassword={() => setShowResetPassword(!showResetPassword)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;