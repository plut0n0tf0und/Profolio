
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function SignupErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast({
        title: 'Sign Up Failed',
        description: decodeURIComponent(error),
        className:
          'px-3 py-2 text-sm border border-neutral-300 bg-neutral-50 text-neutral-900 rounded-lg shadow-md',
      });
      // Clean the URL so the toast won’t repeat on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      router.replace(url.toString());
    }
  }, [searchParams, router, toast]);

  return null; // This component doesn't render anything
}
