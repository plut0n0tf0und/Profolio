
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  openSteps: number[];
  setOpenSteps: React.Dispatch<React.SetStateAction<number[]>>;
  completedSteps: boolean[];
}

const VerticalStepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, children, openSteps, setOpenSteps, completedSteps, ...props }, ref) => {
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
          return React.cloneElement(child as React.ReactElement<StepProps>, {
            isOpen: openSteps.includes(index),
            setIsOpen: (isOpen) => {
              setOpenSteps((prev) =>
                isOpen
                  ? [...prev.filter((s) => s !== index), index]
                  : prev.filter((s) => s !== index)
              );
            },
            isCompleted: completedSteps[index] || false,
            isLastStep: index === totalSteps - 1,
          });
        })}
      </div>
    );
  }
);
VerticalStepper.displayName = 'VerticalStepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  title: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isCompleted?: boolean;
  isLastStep?: boolean;
  children: React.ReactNode;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      className,
      children,
      index,
      title,
      isOpen = false,
      setIsOpen = () => {},
      isCompleted = false,
      isLastStep = false,
      ...props
    },
    ref
  ) => {
    const status = isCompleted ? 'completed' : isOpen ? 'active' : 'inactive';

    return (
      <div
        ref={ref}
        className={cn('relative flex items-start gap-4', className)}
        data-status={status}
        {...props}
      >
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
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
                'flex-grow w-px my-2 transition-colors',
                isCompleted ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="flex-1 w-full"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center cursor-pointer w-full text-left pt-1.5">
              <h3 className="text-xl font-semibold flex-1">{title}</h3>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-4">{children}</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);
Step.displayName = 'Step';

export { VerticalStepper, Step };
