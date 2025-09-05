'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Search, Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { ProjectCard } from '@/components/ProjectCard';

const motivationalTips = [
  'Your UX journey starts here ✦',
  'Good design is invisible ✦',
  'Simplicity is the ultimate sophistication ✦',
  'Empathize with your users ✦',
  'Fail faster to succeed sooner ✦',
];

export default function DashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [tip, setTip] = useState('');

  useEffect(() => {
    setTip(motivationalTips[Math.floor(Math.random() * motivationalTips.length)]);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <UserCircle className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">List of Projects</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="space-y-4">
          <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Projects Yet</h2>
          <p className="text-muted-foreground">Click the '+' icon to add your first project.</p>
        </div>
      </main>

      <footer className="flex h-14 shrink-0 items-center justify-center border-t border-border px-4">
        <p className="text-sm text-muted-foreground">
          {tip}
        </p>
      </footer>
    </div>
  );
}
