import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssessmentsTable } from "./AssessmentsTable"
import { Assessment } from "./types"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { convertAssessmentsToCSV, downloadCSV } from "@/utils/csvExport"

interface StatusTabsProps {
  assessments: Assessment[]
  onStatusUpdate: (assessmentId: string, newStatus: "prescribed" | "denied" | "completed", denialReason?: string) => Promise<void>
}

export const StatusTabs = ({ assessments, onStatusUpdate }: StatusTabsProps) => {
  const draftAssessments = assessments.filter(a => a.status === "draft")
  const completedAssessments = assessments.filter(a => a.status === "completed")
  const prescribedAssessments = assessments.filter(a => a.status === "prescribed")
  const deniedAssessments = assessments.filter(a => a.status === "denied")

  const handleDownload = (statusAssessments: Assessment[], status: string) => {
    const csvContent = convertAssessmentsToCSV(statusAssessments);
    if (csvContent) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(csvContent, `${status}-assessments-${timestamp}.csv`);
    }
  };

  const renderTabHeader = (label: string, count: number, assessments: Assessment[], showCounter: boolean = false) => (
    <div className="relative flex items-center gap-2">
      <span>{label}</span>
      {showCounter && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
          {count}
        </span>
      )}
      {count > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDownload(assessments, label.toLowerCase());
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="completed" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="completed">
          {renderTabHeader("Completed", completedAssessments.length, completedAssessments, true)}
        </TabsTrigger>
        <TabsTrigger value="prescribed">
          {renderTabHeader("Prescribed", prescribedAssessments.length, prescribedAssessments)}
        </TabsTrigger>
        <TabsTrigger value="denied">
          {renderTabHeader("Denied", deniedAssessments.length, deniedAssessments)}
        </TabsTrigger>
        <TabsTrigger value="draft">
          {renderTabHeader("Draft", draftAssessments.length, draftAssessments)}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="completed">
        <AssessmentsTable 
          assessments={completedAssessments} 
          showActions={true}
          onStatusUpdate={onStatusUpdate}
          showDenialReason={false}
        />
      </TabsContent>
      <TabsContent value="prescribed">
        <AssessmentsTable 
          assessments={prescribedAssessments} 
          showActions={false}
          showDenialReason={false}
        />
      </TabsContent>
      <TabsContent value="denied">
        <AssessmentsTable 
          assessments={deniedAssessments} 
          showActions={true}
          onStatusUpdate={onStatusUpdate}
          showDenialReason={true}
        />
      </TabsContent>
      <TabsContent value="draft">
        <AssessmentsTable 
          assessments={draftAssessments} 
          showActions={false}
          showDenialReason={false}
        />
      </TabsContent>
    </Tabs>
  )
}