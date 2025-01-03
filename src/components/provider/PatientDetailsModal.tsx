import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Loader } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicInfoSection } from "./details/BasicInfoSection"
import { MedicalHistorySection } from "./details/MedicalHistorySection"
import { MedicationsSection } from "./details/MedicationsSection"
import { AssessmentDetailsSection } from "./details/AssessmentDetailsSection"
import { ShippingSection } from "./details/ShippingSection"

interface PatientDetailsModalProps {
  patientId: string | null
  isOpen: boolean
  onClose: () => void
}

export const PatientDetailsModal = ({ patientId, isOpen, onClose }: PatientDetailsModalProps) => {
  const { data: assessments, isLoading } = useQuery({
    queryKey: ["patient-assessments", patientId],
    queryFn: async () => {
      if (!patientId) return null
      
      const { data, error } = await supabase
        .from("assessments")
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .eq("user_id", patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!patientId,
  })

  const renderAssessmentContent = (assessment: any) => (
    <div className="space-y-6">
      <BasicInfoSection assessment={assessment} />
      <MedicalHistorySection assessment={assessment} />
      <MedicationsSection assessment={assessment} />
      <AssessmentDetailsSection assessment={assessment} />
      <ShippingSection assessment={assessment} />
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Patient Details: {assessments?.[0]?.profiles?.first_name} {assessments?.[0]?.profiles?.last_name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assessments && assessments.length > 0 ? (
          <ScrollArea className="h-[60vh]">
            <Tabs defaultValue={assessments[0].id} className="w-full">
              <TabsList className="w-full justify-start mb-4">
                {assessments.map((assessment: any) => (
                  <TabsTrigger key={assessment.id} value={assessment.id}>
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </TabsTrigger>
                ))}
              </TabsList>
              {assessments.map((assessment: any) => (
                <TabsContent key={assessment.id} value={assessment.id}>
                  {renderAssessmentContent(assessment)}
                </TabsContent>
              ))}
            </Tabs>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No assessment data found for this patient
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}