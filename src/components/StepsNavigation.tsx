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
  if (currentStep === 5 || currentStep === 6) return null;

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
        {currentStep === 4 ? 'Continue to Payment' : 'Next'}
      </Button>
    </div>
  );
};