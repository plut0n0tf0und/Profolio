
'use client';

import { AuthForm } from '@/components/auth-form';
import { AnimatedGrid } from '@/components/animated-grid';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg md:grid-cols-2 bg-card shadow-lg">
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl font-headline">
            Create an Account
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sign up to get access to magical UX techniques.
          </p>
          <div className="mt-8">
            <AuthForm mode="signup" />
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/" className="font-semibold text-primary hover:underline">
              Log In
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
