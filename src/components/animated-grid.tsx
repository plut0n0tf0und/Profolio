'use client';

import React from "react";
import { cn } from "@/lib/utils";

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
             <div className="absolute inset-0 z-0 h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,white_10%,transparent_70%)]" />
            <div className="relative h-64 w-64">
                {/* Main Box */}
                <div
                    className={cn(
                        "animate-fade-in-up absolute left-1/2 top-1/2 h-24 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-primary/80"
                    )}
                    style={{ animationDelay: '0.2s' }}
                />
                {/* Top small box */}
                <div
                     className={cn(
                        "animate-slide-in-from-top absolute left-1/2 top-0 h-8 w-16 -translate-x-1/2 rounded-md bg-primary/60"
                     )}
                     style={{ animationDelay: '0.6s' }}
                />
                {/* Left small box */}
                 <div
                     className={cn(
                        "animate-slide-in-from-left absolute left-0 top-1/2 h-16 w-8 -translate-y-1/2 rounded-md bg-primary/60"
                     )}
                      style={{ animationDelay: '0.8s' }}
                />
                 {/* Right small box */}
                 <div
                     className={cn(
                        "animate-slide-in-from-right absolute right-0 top-1/2 h-16 w-8 -translate-y-1/2 rounded-md bg-primary/60"
                     )}
                      style={{ animationDelay: '1s' }}
                />
            </div>
            <style jsx>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -30%);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
                @keyframes slide-in-from-top {
                    0% {
                        transform: translate(-50%, -200%);
                        opacity: 0;
                    }
                    100% {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
                 @keyframes slide-in-from-left {
                    0% {
                        transform: translate(-200%, -50%);
                        opacity: 0;
                    }
                    100% {
                        transform: translate(0, -50%);
                        opacity: 1;
                    }
                }
                @keyframes slide-in-from-right {
                    0% {
                        transform: translate(200%, -50%);
                        opacity: 0;
                    }
                    100% {
                        transform: translate(0, -50%);
                        opacity: 1;
                    }
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                .animate-slide-in-from-top {
                    animation: slide-in-from-top 0.5s ease-out forwards;
                }
                .animate-slide-in-from-left {
                    animation: slide-in-from-left 0.5s ease-out forwards;
                }
                .animate-slide-in-from-right {
                    animation: slide-in-from-right 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
