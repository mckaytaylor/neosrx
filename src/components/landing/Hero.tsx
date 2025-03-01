
import { Button } from "@/components/ui/button";

interface HeroProps {
  onStart: () => void;
  onLogin: () => void;
}

export const Hero = ({ onStart, onLogin }: HeroProps) => {
  return (
    <div className="text-center space-y-8 py-20">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <img 
            src="/lovable-uploads/af9d9a2d-f94d-492e-9b15-a1fb438fa7fa.png" 
            alt="NeosRx WELLBOUND Medical Weight Loss Logo" 
            className="h-16"
          />
          <div className="h-10 w-px bg-gray-300 mx-2"></div>
          <img 
            src="/lovable-uploads/7c29b8ad-f3ec-4941-975c-703fc2d9a888.png" 
            alt="BelleHealth Logo" 
            className="h-10"
          />
        </div>
        <p className="text-sm text-gray-500 font-medium">
          A Collaborative Weight Management Program
        </p>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-secondary">
        GLP-1 Medication Assessment
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Complete our comprehensive assessment to determine if GLP-1 medications like Semaglutide or Tirzepatide are right for you.
      </p>
      <div className="flex flex-col items-center gap-4">
        <Button 
          size="lg"
          onClick={onStart}
          className="w-full max-w-md bg-[#8BA89F] hover:bg-[#7A968C] text-white"
        >
          Start Assessment
        </Button>
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#8BA89F]/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-[#8BA89F]">
              Or
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onLogin}
          className="w-full max-w-md border-[#8BA89F] text-[#8BA89F] hover:bg-[#8BA89F]/10"
        >
          Already Started? Log In
        </Button>
      </div>
    </div>
  );
};
