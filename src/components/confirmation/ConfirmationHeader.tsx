import { CheckCircle2 } from "lucide-react";

interface ConfirmationHeaderProps {
  medication: string;
}

export const ConfirmationHeader = ({ medication }: ConfirmationHeaderProps) => {
  const capitalizedMedication = medication?.charAt(0).toUpperCase() + medication?.slice(1);

  return (
    <div className="text-center space-y-4">
      <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
      <h2 className="text-2xl font-bold">
        Your {capitalizedMedication} is being reviewed by our provider
      </h2>
      <p className="text-muted-foreground">
        It should be on its way to you soon!
      </p>
    </div>
  );
};