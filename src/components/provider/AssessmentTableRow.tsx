import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Assessment } from "./types"
import { AssessmentActions } from "./AssessmentActions"

interface AssessmentTableRowProps {
  assessment: Assessment
  showDenialReason: boolean
  showActions: boolean
  onPatientSelect: (userId: string) => void
  onStatusUpdate?: (assessmentId: string, newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => Promise<void>
}

export const AssessmentTableRow = ({
  assessment,
  showDenialReason,
  showActions,
  onPatientSelect,
  onStatusUpdate
}: AssessmentTableRowProps) => {
  const handleStatusUpdate = async (newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => {
    if (onStatusUpdate) {
      await onStatusUpdate(assessment.id, newStatus, denialReason)
    }
  }

  return (
    <TableRow>
      <TableCell>
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => onPatientSelect(assessment.user_id)}
        >
          {assessment.profiles?.first_name} {assessment.profiles?.last_name}
        </Button>
      </TableCell>
      <TableCell>{assessment.plan_type}</TableCell>
      <TableCell>{assessment.medication}</TableCell>
      <TableCell>
        <div className="capitalize">{assessment.status}</div>
      </TableCell>
      {showDenialReason && (
        <TableCell>
          {assessment.denial_reason || "-"}
        </TableCell>
      )}
      <TableCell>
        {assessment.created_at
          ? new Date(assessment.created_at).toLocaleDateString()
          : "N/A"}
      </TableCell>
      {showActions && (
        <TableCell>
          <AssessmentActions 
            status={assessment.status}
            onStatusUpdate={handleStatusUpdate}
          />
        </TableCell>
      )}
    </TableRow>
  )
}