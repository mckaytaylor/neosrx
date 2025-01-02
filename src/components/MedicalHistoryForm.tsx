import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope } from "lucide-react";
import { HeightInput } from "./HeightInput";
import { useToast } from "@/hooks/use-toast";

const medicalConditions = [
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

interface MedicalHistoryFormData {
  selectedConditions: string[];
  otherCondition: string;
  medullaryThyroidCancer: string;
  familyMtcHistory: string;
  men2: string;
  pregnantOrBreastfeeding: string;
  weight: string;
  heightFeet: string;
  heightInches: string;
  exerciseActivity: string;
  takingMedications: string;
  medicationsList: string;
  previousGlp1: string;
  recentGlp1: string;
  hasAllergies: string;
  allergiesList: string;
  takingBloodThinners: string;
}

interface MedicalHistoryFormProps {
  formData: MedicalHistoryFormData;
  onChange: (data: Partial<MedicalHistoryFormData>) => void;
}

export const MedicalHistoryForm = ({ formData, onChange }: MedicalHistoryFormProps) => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Almost there!",
      description: "This is the only long page, we promise. Almost done!",
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Medical History</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">Please select any conditions you have or had in the past:</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {medicalConditions.map((condition) => (
              <div key={condition} className="flex items-start space-x-2">
                <Checkbox
                  id={condition}
                  checked={formData.selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => {
                    const newConditions = checked
                      ? [...formData.selectedConditions, condition]
                      : formData.selectedConditions.filter((c) => c !== condition);
                    onChange({ selectedConditions: newConditions });
                  }}
                />
                <Label htmlFor={condition} className="text-sm leading-none pt-0.5">
                  {condition}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="otherCondition">Other medical conditions:</Label>
            <Textarea
              id="otherCondition"
              value={formData.otherCondition}
              onChange={(e) => onChange({ otherCondition: e.target.value })}
              placeholder="Please specify any other medical conditions..."
              className="mt-1"
            />
          </div>
        </div>

        {[
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
        ].map(({ label, field }) => (
          <div key={field}>
            <Label>{label}</Label>
            <RadioGroup
              value={formData[field]}
              onValueChange={(value) => onChange({ [field]: value })}
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

        <div>
          <Label htmlFor="weight">Current Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => onChange({ weight: e.target.value })}
            className="mt-1"
          />
        </div>

        <HeightInput
          feet={formData.heightFeet}
          inches={formData.heightInches}
          onChange={({ feet, inches }) => onChange({ heightFeet: feet, heightInches: inches })}
        />

        <div>
          <Label>Exercise Activity</Label>
          <RadioGroup
            value={formData.exerciseActivity}
            onValueChange={(value) => onChange({ exerciseActivity: value })}
            className="flex gap-4 mt-1"
          >
            {["Moderate", "Vigorous", "Sedentary"].map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <RadioGroupItem value={activity.toLowerCase()} id={activity} />
                <Label htmlFor={activity}>{activity}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>Currently taking supplements or prescription meds?</Label>
          <RadioGroup
            value={formData.takingMedications}
            onValueChange={(value) => onChange({ takingMedications: value })}
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
          {formData.takingMedications === "yes" && (
            <Textarea
              value={formData.medicationsList}
              onChange={(e) => onChange({ medicationsList: e.target.value })}
              placeholder="Please list all medications and supplements..."
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label>Have you ever taken GLP-1 medications before?</Label>
          <RadioGroup
            value={formData.previousGlp1}
            onValueChange={(value) => onChange({ previousGlp1: value })}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="glp1-yes" />
              <Label htmlFor="glp1-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="glp1-no" />
              <Label htmlFor="glp1-no">No</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.previousGlp1 === "yes" && (
          <div>
            <Label>Have you taken any GLP-1 in the last 8 weeks?</Label>
            <RadioGroup
              value={formData.recentGlp1}
              onValueChange={(value) => onChange({ recentGlp1: value })}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="recent-glp1-yes" />
                <Label htmlFor="recent-glp1-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="recent-glp1-no" />
                <Label htmlFor="recent-glp1-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div>
          <Label>Any known allergies?</Label>
          <RadioGroup
            value={formData.hasAllergies}
            onValueChange={(value) => onChange({ hasAllergies: value })}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="allergies-yes" />
              <Label htmlFor="allergies-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="allergies-no" />
              <Label htmlFor="allergies-no">No</Label>
            </div>
          </RadioGroup>
          {formData.hasAllergies === "yes" && (
            <Textarea
              value={formData.allergiesList}
              onChange={(e) => onChange({ allergiesList: e.target.value })}
              placeholder="Please list allergy and reactions..."
              className="mt-2"
            />
          )}
        </div>

        <div>
          <Label>Are you taking NSAIDs/Blood Thinners?</Label>
          <RadioGroup
            value={formData.takingBloodThinners}
            onValueChange={(value) => onChange({ takingBloodThinners: value })}
            className="flex gap-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="blood-thinners-yes" />
              <Label htmlFor="blood-thinners-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="blood-thinners-no" />
              <Label htmlFor="blood-thinners-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
