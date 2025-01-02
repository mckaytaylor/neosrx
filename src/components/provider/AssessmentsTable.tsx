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
import { StatusBadge } from "./StatusBadge"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

interface AssessmentsTableProps {
  assessments: Assessment[]
}

export const AssessmentsTable = ({ assessments }: AssessmentsTableProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

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

  const handleStatusUpdate = async (assessmentId: string, newStatus: Assessment['status']) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ status: newStatus })
        .eq('id', assessmentId)

      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ["provider-assessments"] })

      toast({
        title: "Status Updated",
        description: "Assessment status has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update assessment status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Group assessments by status
  const groupedAssessments = assessments.reduce((acc, assessment) => {
    const status = assessment.status || "needs_review"
    if (!acc[status]) {
      acc[status] = []
    }
    acc[status].push(assessment)
    return acc
  }, {} as Record<string, Assessment[]>)

  // Order of status display
  const statusOrder = ["needs_review", "prescribed", "denied"]

  return (
    <>
      {statusOrder.map((status) => {
        const statusAssessments = groupedAssessments[status] || []
        if (statusAssessments.length === 0) return null

        return (
          <div key={status} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              {status === "needs_review" ? "Needs Review" : 
               status === "prescribed" ? "Prescribed" :
               "Denied"}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({statusAssessments.length})
              </span>
            </h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Plan Type</TableHead>
                    <TableHead>Medication</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusAssessments.map((assessment) => (
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
                      <TableCell>
                        <StatusBadge status={assessment.status || "needs_review"} />
                      </TableCell>
                      <TableCell>
                        {assessment.created_at
                          ? new Date(assessment.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {status === "needs_review" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(assessment.id, "prescribed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(assessment.id, "denied")}
                              >
                                Deny
                              </Button>
                            </>
                          )}
                          {status !== "needs_review" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(assessment.id, "needs_review")}
                            >
                              Reset Status
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      })}

      <PatientDetailsModal
        patientId={selectedPatientId}
        isOpen={!!selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </>
  )
}