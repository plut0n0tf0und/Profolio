'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { ProjectCard } from '@/components/ProjectCard';

const projects = [
  { id: '1', name: 'QuantumLeap CRM', tags: ['Wireframe', 'Mobile', 'SaaS'] },
  { id: '2', name: 'Nova Financials', tags: ['Quantitative', 'Web App'] },
  { id: '3', name: 'Zenith Health Tracker', tags: ['Mobile', 'User Research'] },
  { id: '4', name: 'Apex E-commerce', tags: ['Web App', 'A/B Testing'] },
  { id: '5', name: 'Serenity AI', tags: ['AI', 'UX Writing'] },
];

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

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onClick={() => router.push(`/dashboard/${project.id}`)}
            />
          ))}
        </div>
      </main>

      <footer className="flex h-14 shrink-0 items-center justify-center border-t border-border px-4">
        <p className="text-sm text-muted-foreground">
          {motivationalTips[Math.floor(Math.random() * motivationalTips.length)]}
        </p>
      </footer>
    </div>
  );
}
