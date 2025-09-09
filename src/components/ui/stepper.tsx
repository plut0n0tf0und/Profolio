
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperContextValue {
  activeStep: number;
}

const StepperContext = React.createContext<StepperContextValue>({
  activeStep: 0,
});

const VerticalStepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { activeStep: number }
>(({ className, children, activeStep, ...props }, ref) => {
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  return (
    <StepperContext.Provider value={{ activeStep }}>
      <div
        ref={ref}
        className={cn('relative flex flex-col gap-4', className)}
        {...props}
      >
        {steps.map((step, index) => {
          if (!React.isValidElement(step)) return null;
          return React.cloneElement(step as React.ReactElement<StepProps>, {
            index,
            isActive: index === activeStep,
            isCompleted: index < activeStep,
            isLastStep: index === totalSteps - 1,
          });
        })}
      </div>
    </StepperContext.Provider>
  );
});
VerticalStepper.displayName = 'VerticalStepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
  status?: 'active' | 'completed' | 'inactive';
  isActive?: boolean;
  isCompleted?: boolean;
  isLastStep?: boolean;
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
      status,
      ...props
    },
    ref
  ) => {
    const determinedStatus =
      status || (isActive ? 'active' : isCompleted ? 'completed' : 'inactive');

    return (
      <div
        ref={ref}
        className={cn('flex items-start gap-4', className)}
        data-status={determinedStatus}
        {...props}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
              determinedStatus === 'active' && 'border-primary text-primary',
              determinedStatus === 'completed' && 'bg-primary border-primary text-primary-foreground',
              determinedStatus === 'inactive' && 'border-border'
            )}
          >
            {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
          </div>
          {!isLastStep && (
            <div
              className={cn(
                'absolute top-8 h-full w-px -translate-y-1 transition-colors',
                isCompleted ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
        <div className={cn('flex-1 w-full pt-1', !isActive && 'hidden')}>
            {children}
        </div>
        <div className={cn('flex-1 w-full pt-1', isActive && 'hidden')}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child) && child.type === StepHeader) {
                    return child;
                }
                return null;
            })}
        </div>
      </div>
    );
  }
);
Step.displayName = 'Step';

const StepHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center cursor-pointer', className)}
    {...props}
  >
    {children}
  </div>
));
StepHeader.displayName = 'StepHeader';

const StepTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-muted-foreground group-data-[status=active]:text-foreground', className)}
    {...props}
  >
    {children}
  </h3>
));
StepTitle.displayName = 'StepTitle';

const StepContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { activeStep } = React.useContext(StepperContext);
    
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


export { VerticalStepper, Step, StepHeader, StepTitle, StepContent };

    