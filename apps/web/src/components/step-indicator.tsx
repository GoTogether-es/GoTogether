'use client';

import clsx from 'clsx';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <nav aria-label="Progreso del registro" className={clsx('w-full', className)}>
      <ol className="flex items-center gap-2">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          const isLast = i === steps.length - 1;

          return (
            <li key={step.label} className={clsx('flex items-center', !isLast && 'flex-1')}>
              <div className="flex items-center gap-2">
                <span
                  className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 transition-colors',
                    isCompleted && 'bg-emerald-500 text-white',
                    isActive && 'bg-blue-600 text-white ring-4 ring-blue-100',
                    !isActive && !isCompleted && 'bg-gray-200 text-gray-500',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={clsx(
                    'text-sm font-semibold hidden sm:inline',
                    isActive && 'text-blue-600',
                    isCompleted && 'text-emerald-600',
                    !isActive && !isCompleted && 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mx-3',
                    isCompleted ? 'bg-emerald-500' : 'bg-gray-200',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
