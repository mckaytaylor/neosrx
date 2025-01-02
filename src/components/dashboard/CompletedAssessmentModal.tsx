import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface CompletedAssessmentModalProps {
  assessment: any;
  open: boolean;
  onClose: () => void;
}

export const CompletedAssessmentModal = ({
  assessment,
  open,
  onClose,
}: CompletedAssessmentModalProps) => {
  if (!assessment) return null;

  const capitalizedMedication = assessment?.medication?.charAt(0).toUpperCase() + assessment?.medication?.slice(1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assessment Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6 p-2">
            {/* Order Summary */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(new Date(assessment.created_at), "PPP")}</span>
                  
                  <span className="text-muted-foreground">Medication:</span>
                  <span>{capitalizedMedication}</span>
                  
                  <span className="text-muted-foreground">Plan:</span>
                  <span>{assessment.plan_type}</span>
                  
                  <span className="text-muted-foreground">Amount:</span>
                  <span>${assessment.amount}</span>
                  
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{assessment.status}</span>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Medical Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Height:</span>
                  <span>
                    {Math.floor(assessment.patient_height / 12)}'{assessment.patient_height % 12}"
                  </span>
                  
                  <span className="text-muted-foreground">Weight:</span>
                  <span>{assessment.patient_weight} lbs</span>
                  
                  <span className="text-muted-foreground">Medical Conditions:</span>
                  <div>
                    {assessment.medical_conditions?.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {assessment.medical_conditions.map((condition: string) => (
                          <li key={condition}>{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>None reported</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Address:</span>
                  <span>{assessment.shipping_address}</span>
                  
                  <span className="text-muted-foreground">City:</span>
                  <span>{assessment.shipping_city}</span>
                  
                  <span className="text-muted-foreground">State:</span>
                  <span>{assessment.shipping_state}</span>
                  
                  <span className="text-muted-foreground">ZIP Code:</span>
                  <span>{assessment.shipping_zip}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};