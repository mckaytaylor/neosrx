import { Button } from "@/components/ui/button";

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
  // Only hide navigation on payment and confirmation screens (steps 6 and 7)
  if (currentStep === 6 || currentStep === 7) return null;

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        Previous
      </Button>
      <Button
        onClick={onNext}
        disabled={isNextDisabled || currentStep === totalSteps}
      >
        {currentStep === 5 ? 'Continue to Payment' : 'Next'}
      </Button>
    </div>
  );
};