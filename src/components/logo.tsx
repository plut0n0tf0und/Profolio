import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn('text-primary', props.className)}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" fill="currentColor" stroke="none" />
      <path d="M12 7v10" stroke="hsl(var(--primary-foreground))" />
      <path d="M12 7a3 3 0 0 1 3 3h-3" stroke="hsl(var(--primary-foreground))" />
    </svg>
  );
}
