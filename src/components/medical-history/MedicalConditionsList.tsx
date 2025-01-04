import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const medicalConditions = [
  "High/Low Blood Pressure",
  "Low Blood Sugar",
  "Type 1 Diabetes",
  "Type 2 Diabetes",
  "Gastroparesis",
  "History of Thyroid Cancer",
  "Thyroid Abnormality",
  "History of Pancreatitis",
  "Hypoglycemia",
  "Chest Pain/Angina",
  "Stroke/CVA",
  "Heart Attack/MI",
  "Seizures",
  "Fainting/Dizziness",
  "Any Heart Surgery/Stent/Cath",
  "Chronic Fatigue",
  "Asthma",
  "Liver Disease",
  "Hepatitis",
  "Kidney Problems",
  "COPD/Emphysema",
  "History of Blood Clots/Bleeding Disorder",
  "HIV AIDS/STDS",
  "Weakness/Paresthesia",
  "Nausea/Motion sickness",
  "Cancer/Any Radiation/Chemotherapy",
  "Difficulty Urinating",
  "Gallbladder Disease",
  "Biliary Tract Disease",
  "Multiple Endocrine Neoplasia Type 2",
  "None of the above"
];

interface MedicalConditionsListProps {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
}

export const MedicalConditionsList = ({ selectedConditions, onChange }: MedicalConditionsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      {medicalConditions.map((condition) => (
        <div key={condition} className="flex items-start space-x-2">
          <Checkbox
            id={condition}
            checked={selectedConditions.includes(condition)}
            onCheckedChange={(checked) => {
              const newConditions = checked
                ? [...selectedConditions, condition]
                : selectedConditions.filter((c) => c !== condition);
              onChange(newConditions);
            }}
          />
          <Label htmlFor={condition} className="text-sm leading-none pt-0.5">
            {condition}
          </Label>
        </div>
      ))}
    </div>
  );
};