
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import FullPortfolioPageContent from './FullPortfolioPageContent';

const PortfolioSkeleton = () => (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        {/* Simplified header for skeleton */}
        <div className="h-9 w-20"></div>
        <h1 className="text-xl font-bold text-center flex-1 truncate">Full Portfolio</h1>
        <div className="w-auto flex justify-end gap-2 h-9 w-24"></div>
        </header>
        <main className="container mx-auto max-w-4xl p-4 md:p-8">
            <div className="space-y-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4 rounded-lg border border-dashed p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading Portfolio...</p>
                </div>
            </div>
        </main>
    </div>
);


export default function FullPortfolioPage() {
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <FullPortfolioPageContent />
    </Suspense>
  )
}
