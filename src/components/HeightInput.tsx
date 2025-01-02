import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeightInputProps {
  feet: string;
  inches: string;
  onChange: (height: { feet: string; inches: string }) => void;
}

export const HeightInput = ({ feet, inches, onChange }: HeightInputProps) => {
  return (
    <div>
      <Label>Height</Label>
      <div className="flex gap-4 mt-1">
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="8"
            value={feet}
            onChange={(e) => onChange({ feet: e.target.value, inches })}
            placeholder="ft"
          />
        </div>
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="11"
            value={inches}
            onChange={(e) => onChange({ feet, inches: e.target.value })}
            placeholder="in"
          />
        </div>
      </div>
    </div>
  );
};