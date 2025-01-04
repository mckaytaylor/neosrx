import { Assessment } from "../types";

interface BasicInfoSectionProps {
  assessment: Assessment;
}

export const BasicInfoSection = ({ assessment }: BasicInfoSectionProps) => {
  // Get profile UTM parameters if assessment UTM parameters are not available
  const utmSource = assessment.utm_source || assessment.profiles?.utm_source;
  const utmMedium = assessment.utm_medium || assessment.profiles?.utm_medium;
  const utmCampaign = assessment.utm_campaign || assessment.profiles?.utm_campaign;
  const utmTerm = assessment.utm_term || assessment.profiles?.utm_term;
  const utmContent = assessment.utm_content || assessment.profiles?.utm_content;

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
            <p>{utmSource || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Medium</p>
            <p>{utmMedium || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Campaign</p>
            <p>{utmCampaign || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Term</p>
            <p>{utmTerm || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Content</p>
            <p>{utmContent || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};