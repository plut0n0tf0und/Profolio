
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface VerticalStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  onStepClick?: (step: number) => void;
  children: React.ReactElement<StepProps>[];
}

export const VerticalStepper = React.forwardRef<HTMLDivElement, VerticalStepperProps>(
  ({ activeStep, children, onStepClick, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative flex flex-col gap-0', className)} {...props}>
        {React.Children.map(children, (child, index) => {
          const isCompleted = index < activeStep;
          const isLastStep = index === children.length - 1;

          return React.cloneElement(child, {
            index,
            isActive: index === activeStep,
            isCompleted,
            isLastStep,
            onStepClick: () => onStepClick?.(index),
          });
        })}
      </div>
    );
  }
);
VerticalStepper.displayName = 'VerticalStepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  index?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
  onStepClick?: () => void;
}

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ children, title, isActive, isCompleted, isLastStep, index = 0, onStepClick, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-start gap-4')} {...props}>
        <div className="relative flex flex-col items-center h-full">
          <div
            className={cn(
              'z-10 flex h-8 w-8 mt-1 items-center justify-center rounded-full border-2 font-bold transition-colors',
              'flex-shrink-0',
              isActive && 'border-primary text-primary',
              isCompleted && 'bg-primary border-primary text-primary-foreground',
              !isActive && !isCompleted && 'border-border text-muted-foreground',
              isCompleted && onStepClick && 'cursor-pointer'
            )}
            onClick={isCompleted ? onStepClick : undefined}
          >
            {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
          </div>
          {!isLastStep && (
            <div
              className={cn(
                'absolute top-10 h-[calc(100%-2.5rem)] w-px transition-colors',
                isCompleted ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
        <div className="flex-1 w-full pb-8 pt-1">
          <h3
            className={cn(
              'text-lg font-semibold text-muted-foreground',
              isActive && 'text-foreground',
              isCompleted && 'text-foreground',
              isCompleted && onStepClick && 'cursor-pointer'
            )}
            onClick={isCompleted ? onStepClick : undefined}
          >
            {title}
          </h3>
          <div className={cn('mt-2 border-t border-border pt-4', !isActive && 'hidden')}>
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Step.displayName = 'Step';
