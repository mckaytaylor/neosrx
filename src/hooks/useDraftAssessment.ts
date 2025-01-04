import { useLoadDraftAssessment } from "./assessment/useLoadDraftAssessment";
import { useSaveDraftAssessment } from "./assessment/useSaveDraftAssessment";
import { AssessmentFormData } from "@/types/assessment";

export const useDraftAssessment = (formData: AssessmentFormData, setFormData: (data: AssessmentFormData) => void) => {
  const { draftAssessmentId } = useLoadDraftAssessment(setFormData);
  useSaveDraftAssessment(formData, draftAssessmentId);

  return { draftAssessmentId };
};