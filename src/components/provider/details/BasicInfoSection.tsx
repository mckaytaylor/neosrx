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
          <p className="text-sm text-gray-500">Name</p>
          <p>{assessment.profiles?.first_name} {assessment.profiles?.last_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p>{assessment.profiles?.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p>{assessment.cell_phone || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date of Birth</p>
          <p>{assessment.date_of_birth ? new Date(assessment.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Gender</p>
          <p className="capitalize">{assessment.gender || 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Height</p>
          <p>{assessment.patient_height ? `${Math.floor(assessment.patient_height / 12)}'${assessment.patient_height % 12}"` : 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Weight</p>
          <p>{assessment.patient_weight ? `${assessment.patient_weight} lbs` : 'Not provided'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Exercise Activity</p>
          <p className="capitalize">{assessment.exercise_activity || 'Not provided'}</p>
        </div>
      </div>
    </div>
  )
}