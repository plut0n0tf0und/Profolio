
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperContextValue {
  activeStep: number;
  totalSteps: number;
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
  totalSteps: 0,
});

// Vertical Stepper Component
const VerticalStepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <StepperContext.Provider value={{ activeStep, totalSteps }}>
      <div
        ref={ref}
        className={cn('relative flex flex-col', className)}
        {...props}
      >
        {steps.map((step, index) => {
          if (!React.isValidElement(step)) return null;
          return React.cloneElement(step as React.ReactElement, {
            index,
            isActive: index === activeStep,
            isCompleted: index < activeStep,
            isLastStep: index === totalSteps - 1,
            setActiveStep,
          });
        })}
      </div>
    </StepperContext.Provider>
  );
});
VerticalStepper.displayName = 'VerticalStepper';


// Step Component
interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  status?: 'active' | 'completed' | 'inactive';
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
  setActiveStep?: (step: number) => void;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      className,
      children,
      index = 0,
      isActive = false,
      isCompleted = false,
      isLastStep = false,
      status, // Allow manual status override
      ...props
    },
    ref
  ) => {
    const determinedStatus =
      status || (isActive ? 'active' : isCompleted ? 'completed' : 'inactive');

    return (
      <div
        ref={ref}
        className={cn('relative flex items-start', className)}
        data-status={determinedStatus}
        {...props}
      >
        <div className="flex flex-col items-center mr-4">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border-2',
              determinedStatus === 'active' && 'border-primary text-primary',
              determinedStatus === 'completed' && 'bg-primary border-primary text-primary-foreground',
              determinedStatus === 'inactive' && 'border-border'
            )}
          >
            {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
          </div>
          {!isLastStep && (
            <div
              className={cn(
                'flex-grow w-px my-2',
                isCompleted ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
        <div className="flex-1 w-full">{children}</div>
      </div>
    );
  }
);
Step.displayName = 'Step';

// Step Header Component
const StepHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center py-1 cursor-pointer', className)}
    {...props}
  >
    {children}
  </div>
));
StepHeader.displayName = 'StepHeader';

// Step Title Component
const StepTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  >
    {children}
  </h3>
));
StepTitle.displayName = 'StepTitle';

// Step Content Component
const StepContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('pl-12 pb-4', className)}
    {...props}
  >
    {children}
  </div>
));
StepContent.displayName = 'StepContent';

export { VerticalStepper, Step, StepHeader, StepTitle, StepContent };
