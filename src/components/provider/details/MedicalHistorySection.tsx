interface MedicalHistorySectionProps {
  assessment: any;
}

export const MedicalHistorySection = ({ assessment }: MedicalHistorySectionProps) => {
  const formatBoolean = (value: boolean | null) => {
    if (value === null) return "Not specified";
    return value ? "Yes" : "No";
  };

  return (
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
  );
};