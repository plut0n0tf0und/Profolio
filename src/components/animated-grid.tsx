'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function AnimatedGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / 25;
    const y = (clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background p-4 [perspective:1000px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={containerRef}
        className={cn(
            "relative w-full max-w-md transform-gpu rounded-2xl border transition-transform duration-300 ease-out [transform-style:preserve-3d]",
            isMouseEntered ? "border-slate-500/30" : "border-transparent"
        )}
      >
        <div className="absolute inset-4 grid h-full w-full grid-cols-2 grid-rows-2 gap-4 [transform-style:preserve-3d] [transform:translateZ(10px)]">
            <div className="col-span-2 row-span-1 rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl backdrop-blur-sm [transform-style:preserve-3d] [transform:translateZ(40px)]">
                <p className="text-sm font-light text-slate-300">Recommendations</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">AI-Powered Insights</p>
            </div>
            <div className="col-span-1 row-span-1 rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl backdrop-blur-sm [transform-style:preserve-3d] [transform:translateZ(20px)]">
                 <p className="text-sm font-light text-slate-300">For</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">Developers</p>
            </div>
            <div className="col-span-1 row-span-1 rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl backdrop-blur-sm [transform-style:preserve-3d] [transform:translateZ(60px)]">
                 <p className="text-sm font-light text-slate-300">UX</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">Techniques</p>
            </div>
        </div>
      </div>
    </div>
  );
}