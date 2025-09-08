
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarOpen ? 'md:ml-[280px]' : 'ml-0'
      )}>
        {/* Floating Toggle Button */}
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "fixed top-4 left-4 z-50 h-9 w-9 transition-transform duration-300 ease-in-out md:hidden",
                isSidebarOpen && "translate-x-[280px]"
            )}
            onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
            {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
        {children}
      </div>
    </div>
  );
}
