
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import RequirementsPageContent from './RequirementsPageContent';


export default function RequirementsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <RequirementsPageContent />
    </Suspense>
  )
}
