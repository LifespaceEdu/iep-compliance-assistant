// IEP Case Types

export interface StudentInfo {
  // Real PII - stored in database, masked before AI
  name: string;
  dateOfBirth: string;
  studentId: string;
  school: string;
  grade: string;
  parentName: string;
  parentEmail?: string;
  address?: string;
}

export interface PIIMappings {
  // Maps real values to placeholders for masking
  [realValue: string]: string;
}

export interface IEPCase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  teacherId: string;
  status: 'intake' | 'in_progress' | 'review' | 'complete';

  // Student info (contains PII)
  studentInfo: StudentInfo;

  // Intake data
  riasecResponses?: RIASECResponse;
  studentInterviewResponses?: InterviewResponse;
  parentInterviewResponses?: InterviewResponse;

  // Uploaded documents (stored as references)
  previousIEPUrl?: string;
  testingDataUrl?: string;

  // Generated content (stored with placeholders, rendered with real values)
  plep?: string;
  goals?: Goal[];
  supplementalServices?: SupplementalService[];
  pwn?: string;
}

export interface RIASECResponse {
  completedAt: Date;
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
  topCategories: string[];
}

export interface InterviewResponse {
  completedAt: Date;
  responses: {
    question: string;
    answer: string;
  }[];
}

export interface Goal {
  id: string;
  area: string; // e.g., "Reading", "Math", "Behavior"
  annualGoal: string;
  baseline: string;
  measurementMethod: string;
  shortTermObjectives: ShortTermObjective[];
}

export interface ShortTermObjective {
  id: string;
  description: string;
  criteria: string;
  targetDate: string;
}

export interface SupplementalService {
  service: string;
  frequency: string;
  duration: string;
  location: string;
  provider: string;
}

// Wizard step tracking
export type WizardStep =
  | 'student-info'
  | 'upload-documents'
  | 'document-analysis'
  | 'plep'
  | 'goals'
  | 'stos'
  | 'services'
  | 'pwn'
  | 'review';

export interface WizardState {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  case: Partial<IEPCase>;
}
