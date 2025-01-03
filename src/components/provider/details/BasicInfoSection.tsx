import { Assessment } from "../types"

interface BasicInfoSectionProps {
  assessment: Assessment
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
    </div>
  )
}