import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill } from "lucide-react";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 6;
  const [formData, setFormData] = useState({
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    selectedMedication: ""
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 2:
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
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="List any conditions..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="allergies">Do you have any allergies?</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any allergies..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currentMedications">Are you currently taking any medications?</Label>
                <Input
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  placeholder="List current medications..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Medication Selection</h3>
            </div>
            <RadioGroup
              value={formData.selectedMedication}
              onValueChange={(value) => setFormData({ ...formData, selectedMedication: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="medication1" id="medication1" />
                <Label htmlFor="medication1" className="flex-1">
                  <div className="font-medium">Medication A</div>
                  <div className="text-sm text-muted-foreground">$50/month</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="medication2" id="medication2" />
                <Label htmlFor="medication2" className="flex-1">
                  <div className="font-medium">Medication B</div>
                  <div className="text-sm text-muted-foreground">$75/month</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted">
                <RadioGroupItem value="medication3" id="medication3" />
                <Label htmlFor="medication3" className="flex-1">
                  <div className="font-medium">Medication C</div>
                  <div className="text-sm text-muted-foreground">$100/month</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );
      default:
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h3>
            <p className="text-muted-foreground">
              Let's continue with your application process.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Patient Application</CardTitle>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} className="mt-2" />
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStep === totalSteps}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;