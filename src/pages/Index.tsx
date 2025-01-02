import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  const handleStart = () => {
    setShowAuth(true);
  };

  const handleAuthSubmit = (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    console.log("Auth data:", data);
    // TODO: Implement authentication
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