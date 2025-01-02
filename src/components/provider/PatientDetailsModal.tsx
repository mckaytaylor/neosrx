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
import { format } from "date-fns"

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
          profiles!assessments_user_id_profiles_fk (
            first_name,
            last_name
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
      <section>
        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Weight</p>
            <p>{assessment.patient_weight} lbs</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Height</p>
            <p>{assessment.patient_height} cm</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p>{assessment.shipping_address}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">City</p>
            <p>{assessment.shipping_city}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">State</p>
            <p>{assessment.shipping_state}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ZIP Code</p>
            <p>{assessment.shipping_zip}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Medical Conditions</h3>
        {assessment.medical_conditions && assessment.medical_conditions.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {assessment.medical_conditions.map((condition: string, index: number) => (
              <li key={index}>{condition}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No medical conditions reported</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Assessment Details</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Selected Medication</p>
            <p>{assessment.medication}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan Type</p>
            <p>{assessment.plan_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="capitalize">{assessment.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Assessment Date</p>
            <p>{format(new Date(assessment.assessment_date), 'PPP')}</p>
          </div>
        </div>
      </section>
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
                    {format(new Date(assessment.created_at), 'PP')}
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