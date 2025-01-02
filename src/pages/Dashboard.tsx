import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Stethoscope, Pill, CreditCard, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 6;
  const [formData, setFormData] = useState({
    medicalConditions: "",
    allergies: "",
    currentMedications: "",
    selectedMedication: "",
    selectedPlan: ""
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
            <p className="text-muted-foreground mb-4">
              Please select which medication you are interested in:
            </p>
            <RadioGroup
              value={formData.selectedMedication}
              onValueChange={(value) => setFormData({ ...formData, selectedMedication: value })}
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
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Select Your Plan</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Monthly Plan */}
              <Card className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                formData.selectedPlan === "monthly" && "border-primary ring-2 ring-primary"
              )}
              onClick={() => setFormData({ ...formData, selectedPlan: "monthly" })}>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Plan</CardTitle>
                  <div className="absolute top-4 right-4">
                    {formData.selectedPlan === "monthly" && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">$349<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Monthly prescription
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Medical consultation included
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Cancel anytime
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Quarterly Plan */}
              <Card className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                formData.selectedPlan === "quarterly" && "border-primary ring-2 ring-primary"
              )}
              onClick={() => setFormData({ ...formData, selectedPlan: "quarterly" })}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Quarterly Plan</CardTitle>
                  <div className="absolute top-4 right-4">
                    {formData.selectedPlan === "quarterly" && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">$299<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground">Save $150 per quarter</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        3-month supply
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Medical consultation included
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Semi-Annual Plan */}
              <Card className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                formData.selectedPlan === "semiannual" && "border-primary ring-2 ring-primary"
              )}
              onClick={() => setFormData({ ...formData, selectedPlan: "semiannual" })}>
                <CardHeader>
                  <CardTitle className="text-lg">Semi-Annual Plan</CardTitle>
                  <div className="absolute top-4 right-4">
                    {formData.selectedPlan === "semiannual" && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">$249<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <p className="text-sm text-muted-foreground">Save $600 per 6 months</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        6-month supply
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        Medical consultation included
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        VIP support access
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 text-sm text-muted-foreground text-center">
              All plans include free shipping and 24/7 medical support
            </div>
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
      <Card className="max-w-4xl mx-auto">
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
              disabled={currentStep === totalSteps || (currentStep === 4 && !formData.selectedPlan)}
            >
              {currentStep === 4 ? 'Continue to Payment' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
