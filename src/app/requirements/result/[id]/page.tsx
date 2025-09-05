
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchRequirementById, Requirement } from '@/lib/supabaseClient';
import { getTechniquesForOutputs } from '@/lib/uxTechniques';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const FiveDProcess = ({ techniques }: { techniques: string[] }) => {
  // A very simple bucketing logic for demonstration.
  // In a real app, this could be more sophisticated.
  const stageTechniques = useMemo(() => {
    const discovery = ['User Interviews', 'Surveys & Questionnaires', 'Contextual Inquiry', 'Ethnographic Study', 'Field Studies', 'Stakeholder Interviews'];
    const definition = ['Personas', 'Empathy Mapping', 'Journey Mapping', 'Problem Statement'];
    const development = ['Wireframing (low-fidelity)', 'Interactive Prototyping', 'Card Sorting', 'Information Architecture (IA) Review'];
    const delivery = ['Usability Testing (Lab)', 'A/B Testing', 'High-fidelity Mockups', 'Accessibility Testing'];
    const deployment = ['Analytics / KPI Tracking', 'Session Replay', 'Feedback Surveys', 'Pilot Launch / Beta Testing'];

    return {
      Discover: techniques.filter(t => discovery.some(d => t.includes(d))),
      Define: techniques.filter(t => definition.some(d => t.includes(d))),
      Develop: techniques.filter(t => development.some(d => t.includes(d))),
      Deliver: techniques.filter(t => delivery.some(d => t.includes(d))),
      Deploy: techniques.filter(t => deployment.some(d => t.includes(d))),
    };
  }, [techniques]);


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>5D Design Process</CardTitle>
        <CardDescription>Recommended UX techniques for your project.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={Object.keys(stageTechniques)} className="w-full">
          {Object.entries(stageTechniques).map(([stage, stageTechs]) => (
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
)


export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const getRequirement = async () => {
      setIsLoading(true);
      const { data, error } = await fetchRequirementById(id);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching requirement',
          description: error.message,
        });
        router.push('/dashboard');
      } else {
        setRequirement(data);
        if (data?.output_type) {
          const recommendedTechniques = getTechniquesForOutputs(data.output_type);
          setTechniques(recommendedTechniques);
        }
      }
      setIsLoading(false);
    };

    getRequirement();
  }, [id, router, toast]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit Requirements?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Would you like to go back and edit your project requirements?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => router.push(`/requirements?id=${id}`)}>
                    Edit Requirements
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
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

          {isLoading ? (
            <RequirementDetailSkeleton />
          ) : (
            <FiveDProcess techniques={techniques} />
          )}
        </div>
      </main>
    </div>
  );
}
