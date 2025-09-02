'use client';

import { cn } from "@/lib/utils"
import React from "react";

export function AnimatedGrid() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const numBoxes = 5;

    if (!isMounted) {
        return null;
    }

    return (
        <div className="absolute inset-0 h-full w-full overflow-hidden bg-background">
            <div className="relative h-full w-full flex items-center justify-center">
                <div className="absolute inset-0 z-0 h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_70%)]" />
                <div className="relative h-1/2 w-1/2">
                    {[...Array(numBoxes)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-lg bg-primary/80"
                            style={{
                                width: `${Math.random() * 80 + 40}px`,
                                height: `${Math.random() * 80 + 40}px`,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animation: `float ${Math.random() * 10 + 10}s infinite alternate-reverse ease-in-out`,
                                animationDelay: `${Math.random() * -5}s`,
                                filter: 'blur(10px) drop-shadow(0 0 15px hsl(var(--primary)))',
                                opacity: 0.5,
                            }}
                        />
                    ))}
                </div>
            </div>
            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    100% {
                        transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) rotate(${Math.random() * 20 - 10}deg);
                    }
                }
            `}</style>
        </div>
    );
}
