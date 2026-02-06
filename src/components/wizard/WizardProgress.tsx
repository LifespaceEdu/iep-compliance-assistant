'use client';

import { WizardStep } from '@/types/iep';

interface WizardProgressProps {
  steps: { id: WizardStep; label: string }[];
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  onStepClick: (step: WizardStep) => void;
}

export function WizardProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCurrent = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id);
              const isClickable = isCompleted || isCurrent;

              return (
                <li key={step.id} className="relative flex-1">
                  {index !== 0 && (
                    <div
                      className={`absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 -ml-2 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ width: 'calc(100% - 1rem)', left: '-50%' }}
                    />
                  )}
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`relative flex flex-col items-center group ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`mt-2 text-xs font-medium hidden sm:block ${
                        isCurrent
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-gray-900'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
