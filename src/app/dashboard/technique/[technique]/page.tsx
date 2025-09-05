
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTechniqueDetails, TechniqueDetailsOutput } from '@/ai/flows/get-technique-details';
import allTechniqueDetails from '@/data/uxTechniqueDetails.json';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Check, Clipboard, ExternalLink, Wand2, PlusCircle, Trash2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const unslugify = (slug: string) => {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const SectionCard = ({ title, children, action, noPadding }: { title: string, children: React.ReactNode, action?: React.ReactNode, noPadding?: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-2xl">{title}</CardTitle>
      {action}
    </CardHeader>
    <CardContent className={noPadding ? 'p-0' : ''}>
      {children}
    </CardContent>
  </Card>
);

const techniqueRemixSchema = z.object({
  date: z.string().optional(),
  duration: z.string().optional(),
  teamSize: z.string().optional(),
  why: z.string().optional(),
  overview: z.string().optional(),
  problemStatement: z.string().optional(),
  role: z.string().optional(),
  prerequisites: z.array(z.object({
    id: z.string(),
    text: z.string(),
    checked: z.boolean(),
  })).optional(),
  executionSteps: z.array(z.object({
    id: z.string(),
    text: z.string(),
    checked: z.boolean(),
  })).optional(),
});

type TechniqueRemixData = z.infer<typeof techniqueRemixSchema>;

const TechniqueDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-28 rounded-full" />
    </div>
    <Separator />
    {[...Array(5)].map((_, i) => (
      <div className="space-y-4" key={i}>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
    ))}
  </div>
);

export default function TechniqueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const techniqueSlug = params.technique as string;
  const techniqueName = useMemo(() => unslugify(techniqueSlug), [techniqueSlug]);

  const [details, setDetails] = useState<TechniqueDetailsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const staticDetails = useMemo(() => {
    return allTechniqueDetails.find(t => t.name.toLowerCase() === techniqueName.toLowerCase());
  }, [techniqueName]);
  
  const form = useForm<TechniqueRemixData>({
    resolver: zodResolver(techniqueRemixSchema),
    defaultValues: {
      date: '',
      duration: '',
      teamSize: '',
      why: '',
      overview: '',
      problemStatement: '',
      role: '',
      prerequisites: [],
      executionSteps: [],
    }
  });

  const { fields: prereqFields, append: appendPrereq, remove: removePrereq } = useFieldArray({
    control: form.control,
    name: "prerequisites",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "executionSteps",
  });

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!techniqueName) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const result = await getTechniqueDetails({ techniqueName });
        setDetails(result);
        // Populate form with fetched details
        form.reset({
            overview: result.overview,
            prerequisites: result.prerequisites.map((p, i) => ({ id: `prereq-${i}`, text: p, checked: false })),
            executionSteps: result.executionSteps.map(s => ({ id: `step-${s.step}`, text: `${s.title}: ${s.description}`, checked: false })),
        });
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
  }, [techniqueName, toast, form]);

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
  
  const onSave = (data: TechniqueRemixData) => {
    console.log("Saving data:", data);
    // Here you would integrate with Supabase to save the remixed technique
    toast({
      title: 'Project Saved!',
      description: 'Your remixed technique has been saved to your project.'
    });
    setIsEditMode(false);
  }

  // Read-only view
  const renderReadOnlyView = () => (
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
      
      <SectionCard title="Execution Steps" action={
        <Button variant="outline" size="sm" onClick={() => copyToClipboard(allStepsText)}>
            <Clipboard className="mr-2 h-4 w-4" />
            Copy Steps
        </Button>
      }>
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
  );

  // Editable Form view
  const renderEditView = () => (
    <FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
      {/* Meta Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Technique Details</CardTitle>
          <CardDescription>Basic information about this remixed technique instance.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="date" render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><Input type="date" {...field} /></FormItem> )} />
          <FormField control={form.control} name="duration" render={({ field }) => ( <FormItem><FormLabel>Duration</FormLabel><Input placeholder="e.g., 2 weeks" {...field} /></FormItem> )} />
          <FormField control={form.control} name="teamSize" render={({ field }) => ( <FormItem><FormLabel>Team Size</FormLabel><Input placeholder="e.g., 3 people" {...field} /></FormItem> )} />
          <FormField control={form.control} name="role" render={({ field }) => ( <FormItem><FormLabel>Your Role</FormLabel><Input placeholder="e.g., Lead UX Researcher" {...field} /></FormItem> )} />
          <FormField control={form.control} name="problemStatement" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Problem Statement</FormLabel><Textarea placeholder="What is the core problem you are trying to solve?" {...field} /></FormItem> )} />
          <FormField control={form.control} name="why" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Why This Technique?</FormLabel><Textarea placeholder="Explain why this technique was chosen for this problem." {...field} /></FormItem> )} />
          <FormField control={form.control} name="overview" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Overview</FormLabel><Textarea placeholder="A brief overview of your plan." {...field} /></FormItem> )} />
        </CardContent>
      </Card>
      
      {/* Prerequisites Section */}
      <SectionCard title="Prerequisites" action={
        <Button type="button" variant="ghost" size="sm" onClick={() => appendPrereq({ id: `prereq-${Date.now()}`, text: '', checked: false })}>
          <PlusCircle className="mr-2 h-4 w-4"/> Add Item
        </Button>
      }>
        <div className="space-y-2">
          {prereqFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Checkbox {...form.register(`prerequisites.${index}.checked`)} />
              <Input {...form.register(`prerequisites.${index}.text`)} placeholder="New prerequisite..." className="flex-1"/>
              <Button type="button" variant="ghost" size="icon" onClick={() => removePrereq(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Execution Steps Section */}
       <SectionCard title="Execution Steps" action={
        <Button type="button" variant="ghost" size="sm" onClick={() => appendStep({ id: `step-${Date.now()}`, text: '', checked: false })}>
          <PlusCircle className="mr-2 h-4 w-4"/> Add Step
        </Button>
      }>
        <div className="space-y-2">
          {stepFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
               <Checkbox {...form.register(`executionSteps.${index}.checked`)} />
               <Input {...form.register(`executionSteps.${index}.text`)} placeholder="New execution step..." className="flex-1"/>
               <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Attachments Section */}
      <Card>
        <CardHeader>
          <CardTitle>References & Attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormItem>
            <FormLabel>Upload Files (Images, PDFs)</FormLabel>
            <Input type="file" multiple />
          </FormItem>
          <FormItem>
            <FormLabel>Add Link</FormLabel>
            <Input placeholder="https://example.com" />
          </FormItem>
           <FormItem>
            <FormLabel>Add Text Note</FormLabel>
            <Textarea placeholder="Paste or type notes here..." />
          </FormItem>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>Cancel</Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
    </FormProvider>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden md:inline">Back</span>
        </Button>
        <h1 className="text-xl font-bold text-center flex-1 truncate px-4">
          {isEditMode ? `Remix: ${techniqueName}` : techniqueName}
        </h1>
        <div className="w-24 flex justify-end"> 
          <Button variant="default" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
            {isEditMode ? <><X className="mr-2 h-4 w-4"/> Cancel</> : <><Wand2 className="mr-2 h-4 w-4" /> Remix</>}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        {isLoading ? (
            <TechniqueDetailsSkeleton />
        ) : (
            isEditMode ? renderEditView() : renderReadOnlyView()
        )}
      </main>
    </div>
  );
}
