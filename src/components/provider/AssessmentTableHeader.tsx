import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AssessmentTableHeaderProps {
  showDenialReason: boolean
  showActions: boolean
}

export const AssessmentTableHeader = ({ 
  showDenialReason, 
  showActions 
}: AssessmentTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Patient Name</TableHead>
        <TableHead>Plan Type</TableHead>
        <TableHead>Medication</TableHead>
        <TableHead>Status</TableHead>
        {showDenialReason && <TableHead>Denial Reason</TableHead>}
        <TableHead>Submission Date</TableHead>
        {showActions && <TableHead>Actions</TableHead>}
      </TableRow>
    </TableHeader>
  )
}