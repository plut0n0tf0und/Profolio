
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperContextValue {
  activeStep: number;
  steps: number;
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
  steps: 0,
});

const VerticalStepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { activeStep: number }
>(({ className, children, activeStep, ...props }, ref) => {
  const steps = React.Children.toArray(children);
  const contextValue = React.useMemo(() => ({ activeStep, steps: steps.length }), [activeStep, steps.length]);

  return (
    <StepperContext.Provider value={contextValue}>
      <div ref={ref} className={cn('relative flex flex-col gap-0', className)} {...props}>
        {children}
      </div>
    </StepperContext.Provider>
  );
});
VerticalStepper.displayName = 'VerticalStepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  children: React.ReactNode;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(({ className, children, index, ...props }, ref) => {
  const { activeStep, steps } = React.useContext(StepperContext);
  const isActive = index === activeStep;
  const isCompleted = index < activeStep;
  const isLastStep = index === steps - 1;

  return (
    <div ref={ref} className={cn('flex items-start gap-4', className)} {...props}>
      <div className="relative flex flex-col items-center h-full">
        <div
          className={cn(
            'z-10 flex h-8 w-8 mt-1 items-center justify-center rounded-full border-2 font-bold transition-colors',
            isActive && 'border-primary text-primary',
            isCompleted && 'bg-primary border-primary text-primary-foreground',
            !isActive && !isCompleted && 'border-border text-muted-foreground'
          )}
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
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          return React.cloneElement(child as React.ReactElement<any>, {
            isActive,
            isCompleted,
            index,
          });
        })}
      </div>
    </div>
  );
});
Step.displayName = 'Step';

interface StepElementProps extends React.HTMLAttributes<HTMLElement> {
  isActive?: boolean;
  isCompleted?: boolean;
  index?: number;
}

const StepHeader = React.forwardRef<HTMLDivElement, StepElementProps>(({ className, children, isCompleted, onClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center',
        isCompleted && onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});
StepHeader.displayName = 'StepHeader';

const StepTitle = React.forwardRef<HTMLHeadingElement, StepElementProps>(({ className, children, isActive, isCompleted, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold text-muted-foreground',
        isActive && 'text-foreground',
        isCompleted && 'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});
StepTitle.displayName = 'StepTitle';

const StepContent = React.forwardRef<HTMLDivElement, StepElementProps>(({ className, isActive, children, ...props }, ref) => {
  if (!isActive) {
    return null;
  }
  return (
    <div
      ref={ref}
      className={cn('mt-2 border-t border-border pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});
StepContent.displayName = 'StepContent';

export { Step, VerticalStepper, StepHeader, StepTitle, StepContent };
