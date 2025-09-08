import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      {...props}
      className={cn('text-primary', props.className)}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="none" />
      <path d="M0 0h24v24H0z" fill="none" />
      <g className="text-primary-foreground" fill="currentColor">
         <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0" className="text-primary" fill="currentColor"/>
         <path d="M14.24 15.44V8.56h-1.92v2.32h-1.2v4.56h3.12zm-3.12-3.6h1.2V9.84h-1.2v2z"/>
      </g>
    </svg>
  );
}
