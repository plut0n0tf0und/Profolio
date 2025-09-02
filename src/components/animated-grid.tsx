'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function AnimatedGrid() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 z-0 h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]" />
       <div
        className={cn(
          'absolute inset-0 z-10 h-full w-full bg-[radial-gradient(circle_farthest-side_at_top_right,_#001f54,_transparent)] opacity-60'
        )}
      />
       <div
        className={cn(
          'absolute inset-0 z-10 h-full w-full bg-[radial-gradient(circle_farthest-corner_at_bottom_left,_#0a2472,_transparent)] opacity-50'
        )}
      />
    </div>
  );
}
