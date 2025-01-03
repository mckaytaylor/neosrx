import { format } from "date-fns";

interface AssessmentDetailsSectionProps {
  assessment: any;
}

export const AssessmentDetailsSection = ({ assessment }: AssessmentDetailsSectionProps) => {
  return (
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
  );
};