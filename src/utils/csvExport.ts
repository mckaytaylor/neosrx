export const convertAssessmentsToCSV = (assessments: any[]) => {
  if (!assessments || assessments.length === 0) return '';

  // Define headers based on the assessment fields we want to include
  const headers = [
    'Patient Name',
    'Email',
    'Date of Birth',
    'Phone',
    'Status',
    'Medication',
    'Plan Type',
    'Amount',
    'Assessment Date',
    'Medical Conditions',
    'Height',
    'Weight',
    'Address',
    'City',
    'State',
    'ZIP',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'UTM Term',
    'UTM Content'
  ];

  // Convert assessments to CSV rows
  const rows = assessments.map(assessment => {
    // Debug log to check UTM data
    console.log('Processing assessment for CSV:', {
      assessmentUtm: {
        source: assessment.utm_source,
        medium: assessment.utm_medium,
        campaign: assessment.utm_campaign,
        term: assessment.utm_term,
        content: assessment.utm_content
      },
      profileUtm: assessment.profiles ? {
        source: assessment.profiles.utm_source,
        medium: assessment.profiles.utm_medium,
        campaign: assessment.profiles.utm_campaign,
        term: assessment.profiles.utm_term,
        content: assessment.profiles.utm_content
      } : null
    });

    return [
      `${assessment.profiles?.first_name || ''} ${assessment.profiles?.last_name || ''}`,
      assessment.profiles?.email || '',
      assessment.date_of_birth || '',
      assessment.cell_phone || '',
      assessment.status || '',
      assessment.medication || '',
      assessment.plan_type || '',
      assessment.amount || '',
      assessment.assessment_date || '',
      Array.isArray(assessment.medical_conditions) ? assessment.medical_conditions.join('; ') : '',
      assessment.patient_height || '',
      assessment.patient_weight || '',
      assessment.shipping_address || '',
      assessment.shipping_city || '',
      assessment.shipping_state || '',
      assessment.shipping_zip || '',
      assessment.profiles?.utm_source || assessment.utm_source || '',
      assessment.profiles?.utm_medium || assessment.utm_medium || '',
      assessment.profiles?.utm_campaign || assessment.utm_campaign || '',
      assessment.profiles?.utm_term || assessment.utm_term || '',
      assessment.profiles?.utm_content || assessment.utm_content || ''
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};