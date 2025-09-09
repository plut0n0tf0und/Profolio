
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

  const contextValue = React.useMemo(() => ({ activeStep, totalSteps }), [activeStep, totalSteps]);

  return (
    <StepperContext.Provider value={{ activeStep }}>
      <div
        ref={ref}
        className={cn('relative flex flex-col gap-0', className)}
        {...props}
      >
        {steps.map((step, index) => {
           if (!React.isValidElement<StepProps>(step)) {
                return null;
            }
           const isCompleted = index < activeStep;
           const isLastStep = index === totalSteps - 1;

          return (
            <div key={step.props.index} className='flex items-start gap-4'>
                 <div className="relative flex flex-col items-center h-full">
                    <div
                        className={cn(
                        'z-10 flex h-8 w-8 mt-1 items-center justify-center rounded-full border-2 font-bold transition-colors',
                        step.props.index === activeStep && 'border-primary text-primary',
                        isCompleted && 'bg-primary border-primary text-primary-foreground',
                        step.props.index > activeStep && 'border-border text-muted-foreground'
                        )}
                    >
                        {isCompleted ? <Check className="h-5 w-5" /> : <span>{step.props.index + 1}</span>}
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
                    {React.cloneElement(step, {
                        isActive: step.props.index === activeStep,
                        isCompleted: isCompleted,
                    })}
                </div>
            </div>
          )
        })}
      </div>
    </StepperContext.Provider>
  );
});
VerticalStepper.displayName = 'VerticalStepper';


interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      className,
      children,
      index,
      isActive,
      isCompleted,
      ...props
    },
    ref
  ) => {
    return (
        <div ref={ref} className={cn("w-full", className)} {...props}>
             {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return null;

                if (child.type === StepContent && !isActive) {
                    return null;
                }
                
                const childProps = {
                    ...child.props,
                    isActive,
                    isCompleted,
                    index,
                };
                return React.cloneElement(child, childProps);
             })}
        </div>
    );
  }
);
Step.displayName = 'Step';


interface StepElementProps extends React.HTMLAttributes<HTMLElement> {
    isActive?: boolean;
    isCompleted?: boolean;
    index?: number;
}

const StepHeader = React.forwardRef<
  HTMLDivElement,
  StepElementProps
>(({ className, children, isCompleted, ...props }, ref) => {
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
  StepElementProps
>(({ className, children, isActive, isCompleted, ...props }, ref) => {
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
  StepElementProps
>((props, ref) => {
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
