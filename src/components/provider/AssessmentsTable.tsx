import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Assessment } from "./types"

interface AssessmentsTableProps {
  assessments: Assessment[]
}

export const AssessmentsTable = ({ assessments }: AssessmentsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Plan Type</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell>
                {assessment.profiles?.first_name} {assessment.profiles?.last_name}
              </TableCell>
              <TableCell>{assessment.plan_type}</TableCell>
              <TableCell>{assessment.medication}</TableCell>
              <TableCell>{assessment.status}</TableCell>
              <TableCell>
                {assessment.created_at
                  ? new Date(assessment.created_at).toLocaleDateString()
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}