
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const VerticalStepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, children, activeStep, setActiveStep, ...props }, ref) => {
    const steps = React.Children.toArray(children);
    const totalSteps = steps.length;

    return (
      <div
        ref={ref}
        className={cn('relative flex flex-col', className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) {
            return null;
          }
          return React.cloneElement(child as React.ReactElement, {
            index,
            isActive: index === activeStep,
            isCompleted: index < activeStep,
            isLastStep: index === totalSteps - 1,
            setActiveStep,
          });
        })}
      </div>
    );
  }
);
VerticalStepper.displayName = 'VerticalStepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
  setActiveStep?: (step: number) => void;
  children: React.ReactNode;
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
      ...props
    },
    ref
  ) => {
    const status = isActive ? 'active' : isCompleted ? 'completed' : 'inactive';

    return (
      <div
        ref={ref}
        className={cn('relative flex items-start', className)}
        data-status={status}
        {...props}
      >
        <div className="flex flex-col items-center mr-4">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border-2',
              status === 'active' && 'border-primary text-primary',
              status === 'completed' && 'bg-primary border-primary text-primary-foreground',
              status === 'inactive' && 'border-border'
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
        <div className="flex-1 w-full pt-1.5">{children}</div>
      </div>
    );
  }
);
Step.displayName = 'Step';

const StepHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pb-4 cursor-pointer', className)}
      {...props}
    >
      {children}
    </div>
  )
);
StepHeader.displayName = 'StepHeader';

const StepTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
StepTitle.displayName = 'StepTitle';

const StepContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pb-4 border-l border-border ml-[15px] pl-8', className)}
      {...props}
    >
      {children}
    </div>
  )
);
StepContent.displayName = 'StepContent';

export { VerticalStepper, Step, StepHeader, StepTitle, StepContent };
