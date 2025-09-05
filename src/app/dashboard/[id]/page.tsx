'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="ml-4 text-xl font-bold">Project {params.id}</h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Project Details</h2>
          <p className="text-muted-foreground">
            Details for project with ID: {params.id} will be displayed here.
          </p>
        </div>
      </main>
    </div>
  );
}
