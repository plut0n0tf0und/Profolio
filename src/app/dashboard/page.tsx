
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';

const motivationalTips = [
  'Your UX journey starts here ✦',
  'Good design is invisible ✦',
  'Simplicity is the ultimate sophistication ✦',
  'Empathize with your users ✦',
  'Fail faster to succeed sooner ✦',
];

const StaticPlaceholder = () => (
    <svg
      width="100"
      height="100"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto text-muted-foreground"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <rect x="7" y="7" width="10" height="5" rx="1" />
      <line x1="7" y1="16" x2="17" y2="16" />
      <line x1="7" y1="14" x2="12" y2="14" />
    </svg>
);


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
          <Link href="/requirements" passHref>
            <Button variant="ghost" size="icon">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="space-y-6">
          <StaticPlaceholder />
           <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Projects Yet</h2>
            <p className="text-muted-foreground">Click the '+' icon to add your first project.</p>
          </div>
          {tip && (
            <p className="text-sm text-muted-foreground">
              {tip}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
