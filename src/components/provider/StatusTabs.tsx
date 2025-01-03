import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssessmentsTable } from "./AssessmentsTable"
import { Assessment } from "./types"

interface StatusTabsProps {
  assessments: Assessment[]
  onStatusUpdate: (assessmentId: string, newStatus: "prescribed" | "denied") => Promise<void>
}

export const StatusTabs = ({ assessments, onStatusUpdate }: StatusTabsProps) => {
  const draftAssessments = assessments.filter(a => a.status === "draft")
  const completedAssessments = assessments.filter(a => a.status === "completed")
  const prescribedAssessments = assessments.filter(a => a.status === "prescribed")
  const deniedAssessments = assessments.filter(a => a.status === "denied")

  return (
    <Tabs defaultValue="completed" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="completed" className="relative">
          Completed
          {completedAssessments.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
              {completedAssessments.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="prescribed">Prescribed</TabsTrigger>
        <TabsTrigger value="denied">Denied</TabsTrigger>
        <TabsTrigger value="draft">Draft</TabsTrigger>
      </TabsList>
      <TabsContent value="completed">
        <AssessmentsTable 
          assessments={completedAssessments} 
          showActions={true}
          onStatusUpdate={onStatusUpdate}
        />
      </TabsContent>
      <TabsContent value="prescribed">
        <AssessmentsTable 
          assessments={prescribedAssessments} 
          showActions={false}
        />
      </TabsContent>
      <TabsContent value="denied">
        <AssessmentsTable 
          assessments={deniedAssessments} 
          showActions={false}
        />
      </TabsContent>
      <TabsContent value="draft">
        <AssessmentsTable 
          assessments={draftAssessments} 
          showActions={false}
        />
      </TabsContent>
    </Tabs>
  )
}