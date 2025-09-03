'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: decodeURIComponent(error),
      });
      router.replace('/login'); // send back to login after showing toast
    } else {
      router.replace('/dashboard');
    }
  }, [searchParams, toast, router]);

  return null; // nothing to render, it's just a handler
}
