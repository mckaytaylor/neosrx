import { format } from "date-fns";

interface BasicInfoSectionProps {
  assessment: any;
}

export const BasicInfoSection = ({ assessment }: BasicInfoSectionProps) => {
  return (
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
          <p className="text-sm text-muted-foreground">Email</p>
          <p>{assessment.profiles?.email || 'Not specified'}</p>
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
  );
};