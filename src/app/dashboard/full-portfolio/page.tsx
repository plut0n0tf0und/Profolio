
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Construction } from 'lucide-react';

export default function FullPortfolioPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <h1 className="text-xl font-bold text-center flex-1 truncate">
          Full Portfolio
        </h1>
        <div className="w-20" />
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Construction className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Coming Soon!</h2>
          <p className="text-muted-foreground">
            This page will display a comprehensive view of all your remixed techniques.
          </p>
        </div>
      </main>
    </div>
  );
}
