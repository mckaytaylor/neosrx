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
import { useToast } from "@/hooks/use-toast"
import { Check, X } from "lucide-react"

interface AssessmentsTableProps {
  assessments: Assessment[]
  showActions?: boolean
  onStatusUpdate?: (assessmentId: string, newStatus: "prescribed" | "denied") => Promise<void>
}

export const AssessmentsTable = ({ 
  assessments,
  showActions = false,
  onStatusUpdate 
}: AssessmentsTableProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePatientSelect = (userId: string) => {
    try {
      setSelectedPatientId(userId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load patient details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (assessmentId: string, newStatus: "prescribed" | "denied") => {
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(assessmentId, newStatus)
        toast({
          title: "Status Updated",
          description: `Assessment has been ${newStatus}.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assessment status. Please try again.",
        variant: "destructive",
      })
    }
  }

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
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessments?.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => handlePatientSelect(assessment.user_id)}
                  >
                    {assessment.profiles?.first_name} {assessment.profiles?.last_name}
                  </Button>
                </TableCell>
                <TableCell>{assessment.plan_type}</TableCell>
                <TableCell>{assessment.medication}</TableCell>
                <TableCell className="capitalize">{assessment.status}</TableCell>
                <TableCell>
                  {assessment.created_at
                    ? new Date(assessment.created_at).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => handleStatusUpdate(assessment.id, "prescribed")}
                      >
                        <Check className="h-4 w-4" />
                        Prescribe
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => handleStatusUpdate(assessment.id, "denied")}
                      >
                        <X className="h-4 w-4" />
                        Deny
                      </Button>
                    </div>
                  </TableCell>
                )}
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