
'use client';

import { AuthForm } from '@/components/auth-form';
import { AnimatedGrid } from '@/components/animated-grid';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: decodeURIComponent(error),
        className: 'px-3 py-2 text-sm border border-neutral-300 bg-neutral-50 text-neutral-900 rounded-lg shadow-md',
      });
      router.replace('/signup'); // clean up ?error= from URL
    }
  }, [searchParams, router, toast]);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2">
        <div className="relative hidden h-full md:flex items-center justify-center p-8">
          <AnimatedGrid />
        </div>
        <div className="flex w-full max-w-md flex-col justify-center gap-6 p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-4">
              <Logo className="h-10 w-10 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Profolio</h1>
            </div>
            <div>
                <h2 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                    Create an Account
                </h2>
                <p className="mt-2 text-muted-foreground">
                    Sign up to get access to magical UX techniques.
                </p>
            </div>
          
            <AuthForm mode="signup" />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/" className="font-semibold text-primary hover:underline">
                Log In
              </Link>
            </p>
        </div>
      </div>
    </main>
  );
}
