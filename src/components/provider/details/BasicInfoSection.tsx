import { Assessment } from "../types";

interface BasicInfoSectionProps {
  assessment: Assessment;
}

export const BasicInfoSection = ({ assessment }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p>{assessment.profiles?.first_name} {assessment.profiles?.last_name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p>{assessment.profiles?.email || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Phone</p>
          <p>{assessment.cell_phone || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date of Birth</p>
          <p>{assessment.date_of_birth ? new Date(assessment.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Gender</p>
          <p className="capitalize">{assessment.gender || 'Not provided'}</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2">UTM Parameters</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Source</p>
            <p>{assessment.utm_source || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Medium</p>
            <p>{assessment.utm_medium || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Campaign</p>
            <p>{assessment.utm_campaign || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Term</p>
            <p>{assessment.utm_term || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Content</p>
            <p>{assessment.utm_content || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};