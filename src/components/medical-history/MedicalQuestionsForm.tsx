import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AssessmentFormData } from "@/types/assessment";

interface MedicalQuestion {
  label: string;
  field: keyof AssessmentFormData;
}

const medicalQuestions: MedicalQuestion[] = [
  {
    label: "Have you been diagnosed with Medullary Thyroid Cancer (MTC)?",
    field: "medullaryThyroidCancer"
  },
  {
    label: "Family history of MTC?",
    field: "familyMtcHistory"
  },
  {
    label: "Multiple Endocrine Neoplasia Syndrome Type 2 (MEN2)?",
    field: "men2"
  },
  {
    label: "Currently pregnant or breastfeeding?",
    field: "pregnantOrBreastfeeding"
  }
];

interface MedicalQuestionsFormProps {
  formData: AssessmentFormData;
  onChange: (field: keyof AssessmentFormData, value: string) => void;
}

export const MedicalQuestionsForm = ({ formData, onChange }: MedicalQuestionsFormProps) => {
  return (
    <div className="space-y-6">
      {medicalQuestions.map(({ label, field }) => (
        <div key={field}>
          <Label>{label}</Label>
          <RadioGroup
            value={formData[field] as string}
            onValueChange={(value) => onChange(field, value)}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${field}-yes`} />
              <Label htmlFor={`${field}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${field}-no`} />
              <Label htmlFor={`${field}-no`}>No</Label>
            </div>
          </RadioGroup>
        </div>
      ))}
    </div>
  );
};