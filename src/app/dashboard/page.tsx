'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

type User = {
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/');
      } else {
        setUser(data.user);
        setLoading(false);
      }
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">AuthNexus</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={displayName || 'User Avatar'}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0"
              onClick={handleLogout}
            >
              <LogOut />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <SidebarTrigger>
            <ChevronLeft className="group-data-[state=expanded]:hidden" />
            <ChevronRight className="group-data-[state=collapsed]:hidden" />
          </SidebarTrigger>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Welcome, {displayName}!
            </h2>
            <p className="text-lg text-muted-foreground">
              You have successfully logged in. You can now start building your application features here.
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
