import React from 'react';
import { Check } from 'lucide-react';

/**
 * NexusFlow — Accessible Multi-Step Wizard Stepper Component
 * Author: Likhitha (Frontend Core / UI Lead)
 * Organization: Infotact Solutions
 * Milestone: Week 3 - Wizard Workflows & Guided Rule Authoring
 *
 * @param {Object} props
 * @param {Array<{ id: string|number, label: string, description?: string }>} props.steps
 * @param {number} props.currentStep - Active step index (0-based)
 * @param {function} [props.onStepClick] - Optional step jump callback
 * @param {string} [props.className]
 */
export default function Stepper({
  steps = [],
  currentStep = 0,
  onStepClick,
  className = '',
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <nav aria-label="Progress Stepper" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = onStepClick && idx <= currentStep;

          return (
            <li
              key={step.id || idx}
              className="flex-1 relative flex flex-col items-center group cursor-default"
            >
              {/* Connecting Line Between Steps */}
              {idx > 0 && (
                <div
                  className={`absolute top-4 -left-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-200 ${
                    idx <= currentStep
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Circle Pill */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(idx)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs transition-all duration-200 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                    : isCurrent
                    ? 'bg-white dark:bg-gray-900 border-2 border-blue-600 text-blue-600 dark:text-blue-400 ring-4 ring-blue-50 dark:ring-blue-950/40 shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </button>

              {/* Step Label & Subtitle */}
              <div className="mt-2 text-center select-none">
                <span
                  className={`block text-xs font-semibold truncate max-w-[120px] ${
                    isCurrent
                      ? 'text-blue-600 dark:text-blue-400'
                      : isCompleted
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
