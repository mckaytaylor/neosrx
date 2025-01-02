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

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "Not specified"
    return value ? "Yes" : "No"
  }

  const renderAssessmentContent = (assessment: any) => (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p>{assessment.date_of_birth ? format(new Date(assessment.date_of_birth), 'PP') : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="capitalize">{assessment.gender || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cell Phone</p>
            <p>{assessment.cell_phone || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weight</p>
            <p>{assessment.patient_weight ? `${assessment.patient_weight} lbs` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Height</p>
            <p>{assessment.patient_height ? `${Math.floor(assessment.patient_height / 12)}'${assessment.patient_height % 12}"` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Exercise Activity</p>
            <p className="capitalize">{assessment.exercise_activity || 'Not specified'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Medical History</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Medical Conditions</p>
            {assessment.medical_conditions && assessment.medical_conditions.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {assessment.medical_conditions.map((condition: string, index: number) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            ) : (
              <p>No medical conditions reported</p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Other Medical Conditions</p>
            <p>{assessment.other_medical_conditions || 'None specified'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Medullary Thyroid Cancer (MTC)</p>
              <p>{formatBoolean(assessment.medullary_thyroid_cancer)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Family History of MTC</p>
              <p>{formatBoolean(assessment.family_mtc_history)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MEN2</p>
              <p>{formatBoolean(assessment.men2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pregnant or Breastfeeding</p>
              <p>{formatBoolean(assessment.pregnant_or_breastfeeding)}</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Medications & Allergies</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Taking Medications</p>
            <p>{formatBoolean(assessment.taking_medications)}</p>
            {assessment.taking_medications && assessment.medications_list && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Medications List</p>
                <p>{assessment.medications_list}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Previous GLP-1 Medications</p>
            <p>{formatBoolean(assessment.previous_glp1)}</p>
            {assessment.previous_glp1 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Recent GLP-1 (Last 8 weeks)</p>
                <p>{formatBoolean(assessment.recent_glp1)}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Has Allergies</p>
            <p>{formatBoolean(assessment.has_allergies)}</p>
            {assessment.has_allergies && assessment.allergies_list && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Allergies List</p>
                <p>{assessment.allergies_list}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Taking Blood Thinners</p>
            <p>{formatBoolean(assessment.taking_blood_thinners)}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Assessment Details</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Selected Medication</p>
            <p className="capitalize">{assessment.medication}</p>
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
            <p>{assessment.assessment_date ? format(new Date(assessment.assessment_date), 'PPP') : 'Not specified'}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p>{assessment.shipping_address || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">City</p>
            <p>{assessment.shipping_city || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">State</p>
            <p>{assessment.shipping_state || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ZIP Code</p>
            <p>{assessment.shipping_zip || 'Not specified'}</p>
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