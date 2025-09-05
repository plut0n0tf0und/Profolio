
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchRequirementById, Requirement } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const FiveDProcess = () => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>5D Design Process</CardTitle>
      <CardDescription>Recommended UX techniques for your project.</CardDescription>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible className="w-full">
        {['Discover', 'Define', 'Develop', 'Deliver', 'Deploy'].map((stage) => (
          <AccordionItem value={stage} key={stage}>
            <AccordionTrigger className="text-lg font-semibold">{stage}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 p-2">
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-medium">Placeholder Technique</span>
                    <Button variant="ghost" size="sm">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Remix
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-medium">Another Technique</span>
                    <Button variant="ghost" size="sm">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Remix
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CardContent>
  </Card>
);

const RequirementDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
       <Skeleton className="h-8 w-3/4" />
       <Skeleton className="h-5 w-1/4" />
    </div>
     <div className="space-y-2">
       <Skeleton className="h-4 w-1/5" />
       <Skeleton className="h-4 w-1/5" />
       <Skeleton className="h-4 w-1/5" />
     </div>
     <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
)


export default function ResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const getRequirement = async () => {
      setIsLoading(true);
      const { data, error } = await fetchRequirementById(params.id);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching requirement',
          description: error.message,
        });
        router.push('/dashboard');
      } else {
        setRequirement(data);
      }
      setIsLoading(false);
    };

    getRequirement();
  }, [params.id, router, toast]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="ml-4 text-xl font-bold">Project Result</h1>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="space-y-8">
           {isLoading ? <RequirementDetailSkeleton /> : requirement && (
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{requirement.project_name}</CardTitle>
                <CardDescription>
                  {requirement.role} &middot; Created on {format(new Date(requirement.date), 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem Statement</h4>
                  <p className="text-muted-foreground">{requirement.problem_statement || 'N/A'}</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">Output Types</h4>
                        <div className="flex flex-wrap gap-2">
                           {requirement.output_type?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Outcomes</h4>
                        <div className="flex flex-wrap gap-2">
                           {requirement.outcome?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Device Types</h4>
                        <div className="flex flex-wrap gap-2">
                           {requirement.device_type?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          )}

          <FiveDProcess />
        </div>
      </main>
    </div>
  );
}
