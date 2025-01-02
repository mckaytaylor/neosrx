import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "lucide-react";

interface BasicInfoFormProps {
  formData: {
    dateOfBirth: string;
    gender: string;
    cellPhone: string;
  };
  onChange: (data: Partial<{
    dateOfBirth: string;
    gender: string;
    cellPhone: string;
  }>) => void;
}

export const BasicInfoForm = ({ formData, onChange }: BasicInfoFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Your Basic Info</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth*</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onChange({ dateOfBirth: e.target.value })}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label>Gender*</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => onChange({ gender: value })}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="cellPhone">Cell Phone*</Label>
          <Input
            id="cellPhone"
            type="tel"
            value={formData.cellPhone}
            onChange={(e) => onChange({ cellPhone: e.target.value })}
            required
            placeholder="(123) 456-7890"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};