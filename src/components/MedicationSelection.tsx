import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pill } from "lucide-react";

interface MedicationSelectionProps {
  selectedMedication: string;
  onMedicationSelect: (medication: string) => void;
}

export const MedicationSelection = ({ selectedMedication, onMedicationSelect }: MedicationSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Pill className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Medication Selection</h3>
      </div>
      <p className="text-muted-foreground mb-4">
        Please select which medication you are interested in:
      </p>
      <RadioGroup
        value={selectedMedication}
        onValueChange={onMedicationSelect}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
          <RadioGroupItem value="tirzepatide" id="tirzepatide" />
          <Label htmlFor="tirzepatide" className="flex-1">
            <div className="font-medium">Tirzepatide</div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
          <RadioGroupItem value="semaglutide" id="semaglutide" />
          <Label htmlFor="semaglutide" className="flex-1">
            <div className="font-medium">Semaglutide</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};