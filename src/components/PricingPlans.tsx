import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  duration: string;
  monthlyPrice: number;
  totalPrice?: number;
  features: string[];
}

interface PricingPlansProps {
  selectedMedication: string;
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
}

export const PricingPlans = ({
  selectedMedication,
  selectedPlan,
  onPlanSelect,
}: PricingPlansProps) => {
  const plans: Record<string, PricingPlan[]> = {
    tirzepatide: [
      {
        duration: "1 month",
        monthlyPrice: 499,
        features: ["Monthly prescription", "Medical consultation included", "Cancel anytime"],
      },
      {
        duration: "3 months",
        monthlyPrice: 270,
        totalPrice: 810,
        features: ["3-month supply", "Medical consultation included", "Priority support"],
      },
      {
        duration: "5 months",
        monthlyPrice: 260,
        totalPrice: 1300,
        features: ["5-month supply", "Medical consultation included", "VIP support access"],
      },
    ],
    semaglutide: [
      {
        duration: "1 month",
        monthlyPrice: 399,
        features: ["Monthly prescription", "Medical consultation included", "Cancel anytime"],
      },
      {
        duration: "4 months",
        monthlyPrice: 160,
        totalPrice: 640,
        features: ["4-month supply", "Medical consultation included", "Priority support"],
      },
      {
        duration: "7 months",
        monthlyPrice: 150,
        totalPrice: 1050,
        features: ["7-month supply", "Medical consultation included", "VIP support access"],
      },
    ],
  };

  const currentPlans = plans[selectedMedication.toLowerCase()];
  const disclaimer = selectedMedication.toLowerCase() === "tirzepatide"
    ? "This is for the initial 3-month ramp-up. After that, the standard dose is 7.25 mg/week."
    : "This is for the initial 3-month ramp-up. After that, the standard dose is 1.25 mg/week.";

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {currentPlans.map((plan, index) => (
          <Card
            key={plan.duration}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-lg",
              selectedPlan === plan.duration.toLowerCase() && "border-primary ring-2 ring-primary"
            )}
            onClick={() => onPlanSelect(plan.duration.toLowerCase())}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">
                {plan.duration.split(" ")[0]} {parseInt(plan.duration) === 1 ? "month" : "months"} of medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  ${plan.monthlyPrice}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                {plan.totalPrice && (
                  <p className="text-sm text-muted-foreground">
                    ${plan.totalPrice} paid in full
                  </p>
                )}
                <ul className="space-y-2 text-sm text-muted-foreground mt-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-sm text-muted-foreground text-center space-y-2">
        <p>All plans include free shipping and 24/7 medical support</p>
        <p className="font-medium">{disclaimer}</p>
      </div>
    </div>
  );
};