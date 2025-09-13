
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
}

const VerticalStepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative flex flex-col gap-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
VerticalStepper.displayName = 'VerticalStepper';

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  title: string;
  isActive?: boolean;
  isCompleted?: boolean;
  children: React.ReactNode;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    {
      className,
      children,
      index,
      title,
      isActive = false,
      isCompleted = false,
      ...props
    },
    ref
  ) => {
    const status = isCompleted ? 'completed' : isActive ? 'active' : 'inactive';

    return (
      <div
        ref={ref}
        className={cn('relative flex flex-col gap-4 py-4', className)}
        data-status={status}
        {...props}
      >
        <Collapsible open={isActive}>
            <CollapsibleTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer">
                    <div className="absolute left-4 -translate-x-1/2 top-4 bottom-4 w-px bg-border -z-10" />
                    <div
                        className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 transition-all bg-background',
                        isActive && 'border-primary text-primary',
                        isCompleted && 'bg-primary border-primary text-primary-foreground',
                        !isActive && !isCompleted && 'border-border text-muted-foreground'
                        )}
                    >
                        {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className={cn('pl-12 w-full pt-6')}>
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);
Step.displayName = 'Step';

export { VerticalStepper, Step };

    