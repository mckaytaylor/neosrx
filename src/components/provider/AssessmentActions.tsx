import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw } from "lucide-react"

interface AssessmentActionsProps {
  status: string
  onStatusUpdate: (newStatus: "prescribed" | "denied" | "completed") => Promise<void>
}

export const AssessmentActions = ({ status, onStatusUpdate }: AssessmentActionsProps) => {
  if (status === "completed") {
    return (
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
          onClick={() => onStatusUpdate("denied")}
        >
          <X className="h-4 w-4" />
          Deny
        </Button>
      </div>
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