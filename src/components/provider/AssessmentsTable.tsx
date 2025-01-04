import { Table, TableBody } from "@/components/ui/table"
import { Assessment } from "./types"
import { useState } from "react"
import { PatientDetailsModal } from "./PatientDetailsModal"
import { useToast } from "@/hooks/use-toast"
import { AssessmentTableHeader } from "./AssessmentTableHeader"
import { AssessmentTableRow } from "./AssessmentTableRow"

interface AssessmentsTableProps {
  assessments: Assessment[]
  showActions?: boolean
  showDenialReason?: boolean
  onStatusUpdate?: (assessmentId: string, newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => Promise<void>
}

export const AssessmentsTable = ({ 
  assessments,
  showActions = false,
  showDenialReason = false,
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

  const handleStatusUpdate = async (assessmentId: string, newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => {
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(assessmentId, newStatus, denialReason)
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
          <AssessmentTableHeader 
            showDenialReason={showDenialReason} 
            showActions={showActions} 
          />
          <TableBody>
            {assessments?.map((assessment) => (
              <AssessmentTableRow
                key={assessment.id}
                assessment={assessment}
                showDenialReason={showDenialReason}
                showActions={showActions}
                onPatientSelect={handlePatientSelect}
                onStatusUpdate={handleStatusUpdate}
              />
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