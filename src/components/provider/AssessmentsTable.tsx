import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Assessment } from "./types"
import { useState } from "react"
import { PatientDetailsModal } from "./PatientDetailsModal"

interface AssessmentsTableProps {
  assessments: Assessment[]
}

export const AssessmentsTable = ({ assessments }: AssessmentsTableProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  return (
    <>
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
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => setSelectedPatientId(assessment.user_id)}
                  >
                    {assessment.profiles?.first_name} {assessment.profiles?.last_name}
                  </Button>
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

      <PatientDetailsModal
        patientId={selectedPatientId}
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </>
  )
}