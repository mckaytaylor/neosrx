import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Stethoscope } from "lucide-react";
import { HeightInput } from "./HeightInput";
import { useToast } from "@/hooks/use-toast";
import { MedicalConditionsList } from "./medical-history/MedicalConditionsList";
import { MedicalQuestionsForm } from "./medical-history/MedicalQuestionsForm";
import { MedicationsForm } from "./medical-history/MedicationsForm";
import { AssessmentFormData } from "@/types/assessment";

interface MedicalHistoryFormProps {
  formData: AssessmentFormData;
  onChange: (data: Partial<AssessmentFormData>) => void;
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
          <Label className="text-base font-medium">
            Please select any conditions you have or had in the past:
          </Label>
          <MedicalConditionsList
            selectedConditions={formData.selectedConditions}
            onChange={(conditions) => onChange({ selectedConditions: conditions })}
          />
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

        <MedicalQuestionsForm
          formData={formData}
          onChange={(field, value) => onChange({ [field]: value })}
        />

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

        <MedicationsForm
          takingMedications={formData.takingMedications}
          medicationsList={formData.medicationsList}
          onTakingMedicationsChange={(value) => onChange({ takingMedications: value })}
          onMedicationsListChange={(value) => onChange({ medicationsList: value })}
        />

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