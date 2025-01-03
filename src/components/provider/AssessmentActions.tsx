import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AssessmentActionsProps {
  status: string
  onStatusUpdate: (newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => Promise<void>
}

export const AssessmentActions = ({ status, onStatusUpdate }: AssessmentActionsProps) => {
  const [showDenialDialog, setShowDenialDialog] = useState(false)
  const [denialReason, setDenialReason] = useState("")
  const { toast } = useToast()

  const handleDeny = async () => {
    if (!denialReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for denial",
        variant: "destructive",
      })
      return
    }
    await onStatusUpdate("denied", denialReason)
    setShowDenialDialog(false)
    setDenialReason("")
  }

  if (status === "completed") {
    return (
      <>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-1"
            onClick={() => onStatusUpdate("prescribed")}
          >
            <Check className="h-4 w-4" />
            Prescribe
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1"
            onClick={() => setShowDenialDialog(true)}
          >
            <X className="h-4 w-4" />
            Deny
          </Button>
        </div>

        <Dialog open={showDenialDialog} onOpenChange={setShowDenialDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Denial Reason</DialogTitle>
              <DialogDescription>
                Please provide a reason for denying this prescription. This will be shared with the patient.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              placeholder="Enter the reason for denial..."
              className="min-h-[100px]"
            />
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDenialDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeny}>
                Confirm Denial
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (status === "denied") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={() => onStatusUpdate("completed")}
      >
        <RotateCcw className="h-4 w-4" />
        Reset to Review
      </Button>
    )
  }

  return null
}