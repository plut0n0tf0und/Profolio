
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getTechniqueDetails, TechniqueDetailsOutput } from '@/ai/flows/get-technique-details';
import allTechniqueDetails from '@/data/uxTechniqueDetails.json';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Check, Clipboard, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const unslugify = (slug: string) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const TechniqueDetailsSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Separator />
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-2/3" />
        </div>
         <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
)


export default function TechniqueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const techniqueSlug = params.technique as string;
  const techniqueName = useMemo(() => unslugify(techniqueSlug), [techniqueSlug]);

  const [details, setDetails] = useState<TechniqueDetailsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const staticDetails = useMemo(() => {
    return allTechniqueDetails.find(t => t.name.toLowerCase() === techniqueName.toLowerCase());
  }, [techniqueName]);

  useEffect(() => {
    if (!techniqueName) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const result = await getTechniqueDetails({ techniqueName });
        setDetails(result);
      } catch (error) {
        console.error("Failed to fetch technique details:", error);
        toast({
          title: 'Error',
          description: 'Could not load details for this technique. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [techniqueName, toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'Execution steps have been copied.',
    });
  };

  const allStepsText = useMemo(() => {
    if (!details?.executionSteps) return '';
    return details.executionSteps.map(s => `${s.step}. ${s.title}: ${s.description}`).join('\n');
  }, [details]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <h1 className="text-xl font-bold text-center flex-1 truncate px-4">
          {techniqueName}
        </h1>
        <div className="w-20" /> 
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        {isLoading ? <TechniqueDetailsSkeleton /> : (
            <div className="space-y-8">
                 <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">{techniqueName}</CardTitle>
                        {staticDetails && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {staticDetails.output_types.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                             {staticDetails.outcomes.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                            {staticDetails.device_types.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                            {staticDetails.project_types.map(t => <Badge key={t} variant="secondary">{t === 'New' ? 'New Project' : 'Existing Project'}</Badge>)}
                        </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-muted-foreground">{details?.overview}</p>
                    </CardContent>
                </Card>

                <SectionCard title="Prerequisites">
                    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                        {details?.prerequisites.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </SectionCard>
                
                <SectionCard title="Execution Steps">
                    <div className="space-y-4">
                        {details?.executionSteps.map(step => (
                            <div key={step.step} className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg flex-shrink-0">
                                    {step.step}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-lg">{step.title}</p>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-6" onClick={() => copyToClipboard(allStepsText)}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy Steps
                    </Button>
                </SectionCard>
                
                <SectionCard title="Resource Links">
                    <div className="grid gap-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-2">Ready-to-use</h4>
                            <div className="space-y-2">
                            {details?.resourceLinks.create.map(link => (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{link.title}</span>
                                </a>
                            ))}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-lg mb-2">Best Practices / Guides</h4>
                            <div className="space-y-2">
                             {details?.resourceLinks.guides.map(link => (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{link.title}</span>
                                </a>
                            ))}
                            </div>
                        </div>
                    </div>
                </SectionCard>
                
                <div className="grid md:grid-cols-2 gap-8">
                     <SectionCard title="Effort & Timing">
                        <p className="text-muted-foreground">{details?.effortAndTiming}</p>
                    </SectionCard>
                    <SectionCard title="Best For">
                         <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                           {details?.bestFor.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </SectionCard>
                </div>

                <SectionCard title="Tips for Good Surveys">
                    <ul className="space-y-3">
                        {details?.tips.map((tip, index) => (
                             <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-muted-foreground">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>

            </div>
        )}
      </main>
    </div>
  );
}
