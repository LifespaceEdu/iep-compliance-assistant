'use client';

import { useState } from 'react';
import { WizardStep, WizardState, IEPCase } from '@/types/iep';
import { WizardProgress } from './WizardProgress';
import { StudentInfoStep } from './steps/StudentInfoStep';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'student-info', label: 'Student Info' },
  { id: 'upload-documents', label: 'Upload Documents' },
  { id: 'document-analysis', label: 'Analysis' },
  { id: 'plep', label: 'Present Levels' },
  { id: 'goals', label: 'Goals & Rubrics' },
  { id: 'stos', label: 'Objectives' },
  { id: 'services', label: 'Services' },
  { id: 'pwn', label: 'Prior Notice' },
  { id: 'review', label: 'Review' },
];

interface WizardContainerProps {
  caseId?: string;
  initialCase?: Partial<IEPCase>;
}

export function WizardContainer({ caseId, initialCase }: WizardContainerProps) {
  const [state, setState] = useState<WizardState>({
    currentStep: 'student-info',
    completedSteps: [],
    case: initialCase || {},
  });

  const currentStepIndex = STEPS.findIndex((s) => s.id === state.currentStep);

  const goToStep = (step: WizardStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const newCompletedSteps = [...state.completedSteps];
      if (!newCompletedSteps.includes(state.currentStep)) {
        newCompletedSteps.push(state.currentStep);
      }
      setState((prev) => ({
        ...prev,
        currentStep: STEPS[currentStepIndex + 1].id,
        completedSteps: newCompletedSteps,
      }));
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentStep: STEPS[currentStepIndex - 1].id,
      }));
    }
  };

  const updateCase = (updates: Partial<IEPCase>) => {
    setState((prev) => ({
      ...prev,
      case: { ...prev.case, ...updates },
    }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 'student-info':
        return (
          <StudentInfoStep
            studentInfo={state.case.studentInfo}
            onUpdate={(studentInfo) => updateCase({ studentInfo })}
            onNext={nextStep}
          />
        );
      case 'upload-documents':
        return (
          <PlaceholderStep
            title="Upload Documents"
            description="Upload the previous IEP and testing data (PDFs)"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'document-analysis':
        return (
          <PlaceholderStep
            title="Document Analysis"
            description="AI analyzes uploaded documents and provides summary"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'plep':
        return (
          <PlaceholderStep
            title="Present Levels (PLEP)"
            description="Interactive Q&A to generate Present Levels of Educational Performance"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'goals':
        return (
          <PlaceholderStep
            title="Goals & Rubrics"
            description="Collaborative chat to develop annual goals based on PLEP"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'stos':
        return (
          <PlaceholderStep
            title="Short-Term Objectives"
            description="Generate measurable objectives for each goal"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'services':
        return (
          <PlaceholderStep
            title="Services & SDI"
            description="Determine supplemental services and specially designed instruction"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'pwn':
        return (
          <PlaceholderStep
            title="Prior Written Notice"
            description="Generate the Prior Written Notice document"
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 'review':
        return (
          <PlaceholderStep
            title="Review & Export"
            description="Review all generated content and export"
            onNext={() => alert('Export functionality coming soon!')}
            onPrev={prevStep}
            isLast
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WizardProgress
        steps={STEPS}
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        onStepClick={goToStep}
      />
      <main className="max-w-4xl mx-auto py-8 px-4">{renderStep()}</main>
    </div>
  );
}

// Temporary placeholder component for unimplemented steps
function PlaceholderStep({
  title,
  description,
  onNext,
  onPrev,
  isLast = false,
}: {
  title: string;
  description: string;
  onNext: () => void;
  onPrev?: () => void;
  isLast?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-8">{description}</p>

      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500 mb-8">
        Step implementation coming soon
      </div>

      <div className="flex justify-between">
        {onPrev ? (
          <button
            onClick={onPrev}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Previous
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isLast ? 'Export' : 'Next'}
        </button>
      </div>
    </div>
  );
}
