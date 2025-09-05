
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchRequirementById, Requirement, saveOrUpdateResult } from '@/lib/supabaseClient';
import { getTechniquesForStage } from '@/lib/uxTechniques';
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
import { ChevronLeft, Wand2, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type StageTechniques = { [key: string]: string[] };

const FiveDProcess = ({ techniques }: { techniques: StageTechniques }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>5D Design Process</CardTitle>
        <CardDescription>Recommended UX techniques for your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={Object.keys(techniques)} className="w-full">
          {Object.entries(techniques).map(([stage, stageTechs]) => (
            <AccordionItem value={stage} key={stage}>
              <AccordionTrigger className="text-lg font-semibold">{stage}</AccordionTrigger>
              <AccordionContent>
                {stageTechs.length > 0 ? (
                  <div className="space-y-3 p-2">
                    {stageTechs.map(technique => (
                      <Card key={technique}>
                        <CardContent className="flex items-center justify-between p-4">
                          <span className="font-medium">{technique}</span>
                          <Button variant="ghost" size="sm">
                            <Wand2 className="mr-2 h-4 w-4" />
                            Remix
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="p-2 text-muted-foreground">No specific techniques recommended for this stage based on your selections.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

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
);

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [stageTechniques, setStageTechniques] = useState<StageTechniques>({});
  const [isLoading, setIsLoading] = useState(true);

  const fiveDStages = useMemo(() => ["Discover", "Define", "Design", "Develop", "Deliver"], []);

  const handleSaveResult = useCallback(async () => {
    if (!requirement || !id) return;
  
    const resultData = {
      requirement_id: id,
      project_name: requirement.project_name || '',
      role: requirement.role || '',
      date: requirement.date ? new Date(requirement.date).toISOString() : new Date().toISOString(),
      problem_statement: requirement.problem_statement || '',
      output_type: Array.isArray(requirement.output_type) ? requirement.output_type : [],
      outcome: Array.isArray(requirement.outcome) ? requirement.outcome : [],
      device_type: Array.isArray(requirement.device_type) ? requirement.device_type : [],
      stage_techniques: stageTechniques || {},
    };
  
    const { error } = await saveOrUpdateResult(id, resultData);
  
    if (error) {
      console.error("Supabase save error:", error);
      toast({
        title: 'Save Failed',
        description: `There was a problem saving your project results: ${error.message}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Project Saved!',
        description: 'Your project results have been successfully saved.',
      });
      router.push('/dashboard');
    }
  }, [requirement, id, stageTechniques, toast, router]);

  useEffect(() => {
    if (!id) return;

    const getRequirement = async () => {
      setIsLoading(true);
      const { data, error } = await fetchRequirementById(id);

      if (error) {
        toast({
            title: 'Error Fetching Project',
            description: 'Could not retrieve project details. Please try again.',
            variant: 'destructive',
        });
        router.push('/dashboard');
      } else if(data) {
        setRequirement(data);

        const categorized: StageTechniques = fiveDStages.reduce((acc, stage) => {
            acc[stage] = getTechniquesForStage(stage);
            return acc;
        }, {} as StageTechniques);

        setStageTechniques(categorized);
      }
      setIsLoading(false);
    };

    getRequirement();
  }, [id, router, toast, fiveDStages]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
          <Button variant="ghost" size="sm" className="hidden shrink-0 md:flex items-center gap-1" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
        </div>
        
        <h1 className="truncate text-center text-xl font-bold md:flex-1">
          Project Result
        </h1>

        <div className="flex items-center justify-end" style={{ minWidth: '80px' }}>
          <Button variant="outline" size="sm" onClick={handleSaveResult} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="space-y-8">
          {isLoading ? <RequirementDetailSkeleton /> : requirement && (
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{requirement.project_name}</CardTitle>
                <CardDescription>
                  {requirement.role} &middot; Created on {requirement.date ? format(new Date(requirement.date), 'PPP') : 'Date not available'}
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

          {isLoading ? (
            <RequirementDetailSkeleton />
          ) : (
            <FiveDProcess techniques={stageTechniques} />
          )}
        </div>
      </main>
    </div>
  );
}
