import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Assessment {
  id: string;
  created_at: string;
  medication: string;
  plan_type: string;
  amount: number;
  status: string;
  medical_conditions: string[];
  patient_weight: number;
  patient_height: number;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching assessments",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Assessment[];
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        toast({
          title: "Error",
          description: "Failed to verify authentication. Please try logging in again.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAuth();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Assessments</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <div className="grid gap-6">
        {assessments?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No assessments found. Start a new assessment to get started.
            </CardContent>
          </Card>
        ) : (
          assessments?.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle>{assessment.medication} Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{assessment.status}</span>
                    
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{assessment.plan_type}</span>
                    
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${assessment.amount}</span>
                    
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(assessment.created_at).toLocaleDateString()}
                    </span>

                    {assessment.medical_conditions && (
                      <>
                        <span className="text-muted-foreground">Medical Conditions:</span>
                        <span className="font-medium">
                          {assessment.medical_conditions.join(", ")}
                        </span>
                      </>
                    )}

                    {assessment.patient_weight && (
                      <>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium">{assessment.patient_weight} lbs</span>
                      </>
                    )}

                    {assessment.patient_height && (
                      <>
                        <span className="text-muted-foreground">Height:</span>
                        <span className="font-medium">
                          {Math.floor(assessment.patient_height / 12)}'{assessment.patient_height % 12}"
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;