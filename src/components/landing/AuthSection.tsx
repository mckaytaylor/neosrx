import { AuthForm } from "@/components/AuthForm";
import { ProgressBar } from "@/components/ProgressBar";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AuthSectionProps {
  showVerificationAlert: boolean;
  userEmail: string;
  isSubmitting: boolean;
  authMode: "login" | "register";
  onSubmit: (data: { email: string; password: string; firstName?: string; lastName?: string }) => void;
  onToggleMode: () => void;
  onResetPassword: (email: string) => void;
  showResetPassword: boolean;
  onToggleResetPassword: () => void;
}

export const AuthSection = ({
  showVerificationAlert,
  userEmail,
  isSubmitting,
  authMode,
  onSubmit,
  onToggleMode,
  onResetPassword,
  showResetPassword,
  onToggleResetPassword,
}: AuthSectionProps) => {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <ProgressBar currentStep={1} totalSteps={7} className="mb-8" />
      {showVerificationAlert && (
        <Alert className="border-[#8BA89F]/20 bg-[#8BA89F]/5">
          <AlertDescription className="space-y-3">
            <p>We've sent a verification email to <strong>{userEmail}</strong></p>
            <p>Please check your inbox and click the verification link to complete your registration. The verification link will redirect you back to the application.</p>
            <p>Don't see the email? Check your spam folder or request a new verification email.</p>
          </AlertDescription>
        </Alert>
      )}
      <div className="bg-white p-8 rounded-lg shadow-lg border border-[#8BA89F]/10">
        <h2 className="text-2xl font-semibold text-[#8BA89F] mb-6 text-center">
          {showResetPassword 
            ? "Reset Password"
            : authMode === "login" 
              ? "Welcome Back" 
              : "Create Your Account"}
        </h2>
        <AuthForm
          mode={authMode}
          onSubmit={onSubmit}
          onToggleMode={onToggleMode}
          disabled={isSubmitting}
          onResetPassword={onResetPassword}
          showResetPassword={showResetPassword}
          onToggleResetPassword={onToggleResetPassword}
        />
      </div>
    </div>
  );
};