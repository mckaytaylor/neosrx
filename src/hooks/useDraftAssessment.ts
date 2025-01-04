import { useLoadDraftAssessment } from "./assessment/useLoadDraftAssessment";
import { useSaveDraftAssessment } from "./assessment/useSaveDraftAssessment";

export const useDraftAssessment = (formData: any, setFormData: (data: any) => void) => {
  const { draftAssessmentId } = useLoadDraftAssessment(setFormData);
  useSaveDraftAssessment(formData, draftAssessmentId);

  return { draftAssessmentId };
};