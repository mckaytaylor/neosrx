import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StepsNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
}

export const StepsNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isNextDisabled = false,
}: StepsNavigationProps) => {
  const navigate = useNavigate();

  // Only hide navigation on payment and confirmation screens (steps 6 and 7)
  if (currentStep === 6 || currentStep === 7) return null;

  const handleSaveAndExit = () => {
    // Since we're already auto-saving, we can just navigate back
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex justify-between mt-8">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveAndExit}
        >
          Save & Exit
        </Button>
      </div>
      <Button
        onClick={onNext}
        disabled={isNextDisabled || currentStep === totalSteps}
      >
        {currentStep === 5 ? 'Continue to Payment' : 'Next'}
      </Button>
    </div>
  );
};