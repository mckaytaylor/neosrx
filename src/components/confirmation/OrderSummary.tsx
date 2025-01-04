import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSummaryProps {
  medication: string;
  planType: string;
  amount: number;
}

export const OrderSummary = ({ medication, planType, amount }: OrderSummaryProps) => {
  const capitalizedMedication = medication?.charAt(0).toUpperCase() + medication?.slice(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-muted-foreground">Medication:</span>
          <span className="font-medium">{capitalizedMedication}</span>
          
          <span className="text-muted-foreground">Plan:</span>
          <span className="font-medium">{planType}</span>
          
          <span className="text-muted-foreground">Total Amount:</span>
          <span className="font-medium">${amount}</span>
        </div>

        <div className="border-t pt-4 mt-4 space-y-2">
          <h4 className="font-medium">What's Next?</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Our medical provider will review your information within 24-48 hours</li>
            <li>Your credit card has been preauthorized, and the payment will finalize once you have been approved for the medication</li>
            <li>You'll receive an email confirmation once your prescription is approved</li>
            <li>Your medication will be shipped directly to your address</li>
            <li>Track your order status in your dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};