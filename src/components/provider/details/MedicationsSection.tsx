interface MedicationsSectionProps {
  assessment: any;
}

export const MedicationsSection = ({ assessment }: MedicationsSectionProps) => {
  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "Not specified";
    return value ? "Yes" : "No";
  };

  return (
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
  );
};