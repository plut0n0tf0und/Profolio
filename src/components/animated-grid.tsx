'use client';

import { cn } from "@/lib/utils"
import React from "react";

export function AnimatedGrid() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const numSquares = 150;

    if (!isMounted) {
        return null;
    }

    return (
        <div className="absolute inset-0 h-full w-full overflow-hidden bg-background">
            <div className="relative h-full w-full">
                <div className="absolute inset-0 z-0 h-full w-full bg-background [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" />
                <div
                    className={cn(
                        "absolute inset-[--grid-safe-area] h-[calc(100%-2*var(--grid-safe-area))] w-[calc(100%-2*var(--grid-safe-area))] [--grid-safe-area:1.5rem]",
                        "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]",
                    )}
                >
                    <div
                        className="absolute h-full w-full -z-10"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(10, 1fr)`,
                            gridTemplateRows: `repeat(15, 1fr)`,
                            gap: '1rem',
                        }}
                    >
                        {[...Array(numSquares)].map((_, i) => (
                            <div
                                key={i}
                                className="h-full w-full rounded-md border border-primary/10 bg-primary/5"
                                style={{
                                    animation: `pulse ${Math.random() * 5 + 2}s infinite alternate`,
                                    animationDelay: `${Math.random() * 3}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes pulse {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}