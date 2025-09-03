'use client';

import { AuthForm } from '@/components/auth-form';
import { AnimatedGrid } from '@/components/animated-grid';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: decodeURIComponent(error),
      });
    }
  }, [error, toast]);


  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg md:grid-cols-2 bg-card shadow-lg">
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl font-headline">
            Welcome Back
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Log in to access your dashboard.
          </p>
          <div className="mt-8">
            <AuthForm mode="login" />
          </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/" className="font-semibold text-primary hover:underline">
                Sign Up
              </Link>
            </p>
        </div>
        <div className="relative hidden h-full md:block">
          <AnimatedGrid />
        </div>
      </div>
    </main>
  );
}
