import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope } from "lucide-react";

interface MedicalHistoryFormProps {
  formData: {
    medicalConditions: string;
    allergies: string;
    currentMedications: string;
  };
  onChange: (data: Partial<{
    medicalConditions: string;
    allergies: string;
    currentMedications: string;
  }>) => void;
}

export const MedicalHistoryForm = ({ formData, onChange }: MedicalHistoryFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Medical History</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="medicalConditions">Do you have any pre-existing medical conditions?</Label>
          <Input
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => onChange({ medicalConditions: e.target.value })}
            placeholder="List any conditions..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="allergies">Do you have any allergies?</Label>
          <Input
            id="allergies"
            value={formData.allergies}
            onChange={(e) => onChange({ allergies: e.target.value })}
            placeholder="List any allergies..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="currentMedications">Are you currently taking any medications?</Label>
          <Input
            id="currentMedications"
            value={formData.currentMedications}
            onChange={(e) => onChange({ currentMedications: e.target.value })}
            placeholder="List current medications..."
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};