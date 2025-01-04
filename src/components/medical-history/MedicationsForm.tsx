import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface MedicationsFormProps {
  takingMedications: string;
  medicationsList: string;
  onTakingMedicationsChange: (value: string) => void;
  onMedicationsListChange: (value: string) => void;
}

export const MedicationsForm = ({
  takingMedications,
  medicationsList,
  onTakingMedicationsChange,
  onMedicationsListChange,
}: MedicationsFormProps) => {
  return (
    <div>
      <Label>Currently taking supplements or prescription meds?</Label>
      <RadioGroup
        value={takingMedications}
        onValueChange={onTakingMedicationsChange}
        className="flex gap-4 mt-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="meds-yes" />
          <Label htmlFor="meds-yes">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="meds-no" />
          <Label htmlFor="meds-no">No</Label>
        </div>
      </RadioGroup>
      {takingMedications === "yes" && (
        <Textarea
          value={medicationsList}
          onChange={(e) => onMedicationsListChange(e.target.value)}
          placeholder="Please list all medications and supplements..."
          className="mt-2"
        />
      )}
    </div>
  );
};