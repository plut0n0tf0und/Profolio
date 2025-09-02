'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type User = {
  email?: string;
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
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-lg border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Your Dashboard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You have successfully logged in!
        </p>
        {user?.email && (
          <p className="mt-2 text-md text-foreground">
            Signed in as: <span className="font-semibold">{user.email}</span>
          </p>
        )}
        <div className="mt-8">
          <Button
            onClick={handleLogout}
            className="w-full max-w-xs bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Log Out
          </Button>
        </div>
      </div>
    </main>
  );
}
