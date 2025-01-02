import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import ProviderDashboard from "@/components/ProviderDashboard";
import { PatientDashboard } from "@/components/PatientDashboard";

const Dashboard = () => {
  const [isProvider, setIsProvider] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        const isProviderUser = user.user_metadata?.role === 'provider' && 
                             user.user_metadata?.provider === true;
        
        setIsProvider(isProviderUser);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        toast({
          title: "Error",
          description: "Failed to verify user role. Please try logging in again.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkUserRole();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      {isProvider ? (
        <ProviderDashboard />
      ) : (
        <PatientDashboard />
      )}
    </div>
  );
};

export default Dashboard;