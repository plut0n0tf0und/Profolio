
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';

const motivationalTips = [
  'Your UX journey starts here ✦',
  'Good design is invisible ✦',
  'Simplicity is the ultimate sophistication ✦',
  'Empathize with your users ✦',
  'Fail faster to succeed sooner ✦',
];

const AnimatedPlaceholder = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto text-muted-foreground"
  >
    <style>
      {`
        .pulse {
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }
      `}
    </style>
    <path
      className="pulse"
      d="M12 2L12 2C17.5228 2 22 6.47715 22 12V12C22 17.5228 17.5228 22 12 22V22C6.47715 22 2 17.5228 2 12V12C2 6.47715 6.47715 2 12 2V2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
          <Button variant="ghost" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
        <div className="space-y-6">
          <AnimatedPlaceholder />
           <div className="space-y-2">
            <h2 className="text-2xl font-bold">No Projects Yet</h2>
            <p className="text-muted-foreground">Click the '+' icon to add your first project.</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {tip}
          </p>
        </div>
      </main>
    </div>
  );
}
