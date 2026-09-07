/**
 * ProgressTracker Component - Carbon Design System
 * Shows real-time research progress with flat, square design
 */

'use client';

import { AgentName } from '@/types/research';

interface ProgressTrackerProps {
  progress: number;
  currentAgent: AgentName | null;
  isComplete: boolean;
  statusMessage?: string;
}

const agentLabels: Record<AgentName, string> = {
  coordinator: 'Analyzing Query',
  web_search: 'Searching Web',
  analysis: 'Analyzing Sources',
  synthesis: 'Synthesizing Information',
  fact_checker: 'Fact Checking',
  report_writer: 'Writing Report',
};

const agentOrder: AgentName[] = [
  'coordinator',
  'web_search',
  'analysis',
  'synthesis',
  'fact_checker',
  'report_writer',
];

export function ProgressTracker({ progress, currentAgent, isComplete, statusMessage }: ProgressTrackerProps) {
  const getCurrentStep = () => {
    if (isComplete) return agentOrder.length;
    if (!currentAgent) return 0;
    return agentOrder.indexOf(currentAgent) + 1;
  };

  const currentStep = getCurrentStep();
  const totalSteps = agentOrder.length;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Status Message Box - Carbon styling */}
      {!isComplete && currentAgent && (
        <div className="mb-lg p-lg bg-surface-1 border border-hairline">
          <div className="flex items-start gap-md">
            {/* Animated spinner */}
            <div className="flex-shrink-0 mt-xxs">
              <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            <div className="flex-1">
              <h3 className="text-body-emphasis text-ink mb-xs">
                {agentLabels[currentAgent]}
              </h3>
              <p className="text-body-sm text-ink-muted">
                {statusMessage || `${agentLabels[currentAgent]} is working...`}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <span className="text-body-sm text-ink font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar - Carbon flat design */}
      <div className="mb-xl">
        <div className="flex justify-between items-center mb-xs">
          <span className="text-body-sm text-ink">
            {isComplete ? 'Complete!' : currentAgent ? agentLabels[currentAgent] : 'Starting...'}
          </span>
          <span className="text-body-sm text-ink">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full bg-surface-2 h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isComplete
                ? 'bg-semantic-success'
                : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators - Carbon flat squares */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-5 left-0 right-0 h-px bg-hairline" />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {agentOrder.map((agent, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep || isComplete;
            const isPending = stepNumber > currentStep && !isComplete;

            return (
              <div key={agent} className="flex flex-col items-center">
                {/* Square indicator - Carbon flat design */}
                <div
                  className={`w-10 h-10 flex items-center justify-center text-body-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-semantic-success text-canvas'
                      : isActive
                      ? 'bg-primary text-on-primary border-2 border-primary'
                      : 'bg-surface-1 text-ink-muted border border-hairline'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Label */}
                <div className="mt-xs text-center">
                  <p
                    className={`text-caption max-w-[80px] ${
                      isActive
                        ? 'text-primary font-semibold'
                        : isCompleted
                        ? 'text-semantic-success'
                        : 'text-ink-muted'
                    }`}
                  >
                    {agentLabels[agent]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message - Carbon styling */}
      {isComplete && (
        <div className="mt-xl p-md bg-canvas border-2 border-semantic-success">
          <div className="flex items-center gap-xs">
            <svg className="w-5 h-5 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-body-sm text-ink">
              Research completed successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}