
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

const VerticalStepper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { activeStep: number }
>(({ className, children, activeStep, ...props }, ref) => {
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  return (
    <StepperContext.Provider value={{ activeStep, totalSteps }}>
      <div
        ref={ref}
        className={cn('relative flex flex-col gap-4', className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
});
VerticalStepper.displayName = 'VerticalStepper';


interface StepContextValue {
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    isLastStep: boolean;
}

const StepContext = React.createContext<StepContextValue>({
    index: 0,
    isActive: false,
    isCompleted: false,
    isLastStep: false,
});


interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  children: React.ReactNode;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      className,
      children,
      index,
      ...props
    },
    ref
  ) => {
    const { activeStep, totalSteps } = React.useContext(StepperContext);
    const isActive = index === activeStep;
    const isCompleted = index < activeStep;
    const isLastStep = index === totalSteps - 1;

    const contextValue = React.useMemo(() => ({
        index,
        isActive,
        isCompleted,
        isLastStep,
    }), [index, isActive, isCompleted, isLastStep]);

    const status = isActive ? 'active' : isCompleted ? 'completed' : 'inactive';

    return (
      <StepContext.Provider value={contextValue}>
        <div
            ref={ref}
            className={cn('flex items-start gap-4', className)}
            data-status={status}
            {...props}
        >
            <div className="relative flex flex-col items-center">
                <div
                    className={cn(
                    'z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold transition-colors',
                    status === 'active' && 'border-primary text-primary',
                    status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                    status === 'inactive' && 'border-border text-muted-foreground'
                    )}
                >
                    {isCompleted ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
                </div>
                {!isLastStep && (
                    <div
                    className={cn(
                        'absolute top-9 h-[calc(100%-1rem)] w-px -translate-y-1 transition-colors',
                        isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                    />
                )}
            </div>
            <div className="flex-1 w-full pt-1">
                {children}
            </div>
        </div>
      </StepContext.Provider>
    );
  }
);
Step.displayName = 'Step';


const StepHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isCompleted } = React.useContext(StepContext);
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center',
        isCompleted && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
StepHeader.displayName = 'StepHeader';

const StepTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  const { isCompleted, isActive } = React.useContext(StepContext);
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

const StepContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
    const { isActive } = React.useContext(StepContext);

    if (!isActive) {
        return null;
    }

    return (
        <div
            ref={ref}
            className={cn('mt-2 border-t border-border pt-4')}
            {...props}
        />
    );
});
StepContent.displayName = 'StepContent';


export { Step, VerticalStepper, StepHeader, StepTitle, StepContent };
