
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { insertRequirement, fetchRequirementById, updateRequirement } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { VerticalStepper, Step, StepHeader, StepTitle, StepContent } from '@/components/ui/stepper';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { CalendarIcon, Loader2, ChevronLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  project_name: z.string().min(1, 'Project name is required.'),
  date: z.date(),
  problem_statement: z.string().min(1, 'Problem statement is required.'),
  role: z.string().min(1, 'Your role is required.'),
  output_type: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one output type.',
  }),
  outcome: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one outcome.',
  }),
  device_type: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one device type.',
  }),
  project_type: z.enum(['new', 'old'], {
    required_error: 'You need to select a project type.',
  }),
});

type FormSchemaType = z.infer<typeof formSchema>;


const sectionSchemas = [
  formSchema.pick({ project_name: true, date: true, problem_statement: true, role: true }),
  formSchema.pick({ output_type: true }),
  formSchema.pick({ outcome: true }),
  formSchema.pick({ device_type: true }),
  formSchema.pick({ project_type: true }),
];


const outputTypes = [
    "Presentation",
    "Video",
    "Interactive Prototype",
    "UI Design",
    "Visual Design",
    "Motion Design",
    "Animation",
    "Voice Interaction",
    "Wireframe",
    "Information Architecture"
];
const outcomes = ['Qualitative', 'Quantitative', 'Insight'];
const deviceTypes = ['Mobile', 'Desktop', 'Electronics', 'Kiosk'];

function RequirementsPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementId, setRequirementId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_name: '',
      date: new Date(),
      problem_statement: '',
      role: '',
      output_type: [],
      outcome: [],
      device_type: [],
    },
  });

  useEffect(() => {
    const id = searchParams.get('id');
    setIsLoading(true);
    if (id) {
      setRequirementId(id);
      const loadRequirement = async () => {
        const { data, error } = await fetchRequirementById(id);
        if (error) {
          console.error("Failed to load project requirement:", error);
          toast({
            title: 'Failed to load project',
            description: 'Could not fetch existing project details.',
            variant: 'destructive'
          });
        } else if (data) {
          form.reset({
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
            output_type: data.output_type || [],
            outcome: data.outcome || [],
            device_type: data.device_type || [],
            project_type: data.project_type as 'new' | 'old' | undefined,
          });
        }
        setIsLoading(false);
      };
      loadRequirement();
    } else {
        setIsLoading(false);
    }
  }, [searchParams, form, toast]);

  const handleNextStep = async (currentStep: number) => {
    const schemaForStep = sectionSchemas[currentStep];
    const fieldsToValidate = Object.keys(schemaForStep.shape) as (keyof FormSchemaType)[];

    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) {
        toast({
            title: 'Validation Error',
            description: 'Please fill in all required fields for this section.',
            variant: 'destructive',
        });
        return;
    }

    setIsSubmitting(true);
    
    const values = form.getValues();
    const sectionData = fieldsToValidate.reduce((acc, key) => {
      acc[key] = values[key];
      return acc;
    }, {} as any);
    
    if (sectionData.date && sectionData.date instanceof Date) {
      sectionData.date = sectionData.date.toISOString();
    }

    try {
      let savedData;
      if (requirementId) {
        const { data, error } = await updateRequirement(requirementId, sectionData);
        if (error) throw error;
        savedData = data;
      } else {
        const { data, error } = await insertRequirement(values); // Pass all values
        if (error) throw error;
        savedData = data;
        if (savedData?.id) {
          setRequirementId(savedData.id);
           const newUrl = `${window.location.pathname}?id=${savedData.id}`;
           window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        }
      }

      toast({
        title: 'Progress Saved!',
        description: `Section has been successfully saved.`,
      });
      
      const totalSteps = sectionSchemas.length;
      if (currentStep < totalSteps - 1) {
        setActiveStep(currentStep + 1);
      } else {
        const finalId = requirementId || savedData?.id;
        if (finalId) {
            router.push(`/requirements/result/${finalId}`);
        } else {
            throw new Error("Could not find requirement ID to show results.");
        }
      }
    } catch (error: any) {
      console.error("Error saving requirement section:", error);
      toast({
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem saving your requirements.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const PageSkeleton = () => (
    <Card className="w-full">
        <CardHeader>
            <Skeleton className="h-9 w-3/5" />
            <Skeleton className="h-4 w-4/5 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </CardContent>
    </Card>
  );

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < activeStep) {
        setActiveStep(stepIndex);
    }
  };

  if (isLoading) {
    return (
         <div className="flex min-h-screen flex-col bg-background text-foreground">
             <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
                <Button variant="ghost" size="icon" className="shrink-0" disabled>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="ml-2 text-xl ">Back</h1>
            </header>
            <main className="container mx-auto max-w-3xl flex-1 p-4 md:p-8">
                <PageSkeleton />
            </main>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className='p-2'>
              <ChevronLeft className="h-6 w-6" />
              <span className='ml-2'>Back</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
              <AlertDialogDescription>
                Any unsaved changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/dashboard')}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      <main className="container mx-auto max-w-3xl flex-1 p-4 md:p-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Define Your Project</CardTitle>
          <CardDescription>
            Fill out the details below to get tailored UX recommendations. Save your progress at each step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <VerticalStepper activeStep={activeStep}>
                    <Step index={0}>
                        <StepHeader onClick={() => handleStepClick(0)}>
                            <StepTitle>Basic Project Details</StepTitle>
                        </StepHeader>
                        <StepContent>
                            <div className="space-y-4">
                                <FormField control={form.control} name="project_name" render={({ field }) => ( <FormItem> <FormLabel>Project Name</FormLabel> <FormControl> <Input placeholder="e.g., AuthNexus Redesign" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Date</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground' )}> {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="problem_statement" render={({ field }) => ( <FormItem> <FormLabel>Problem Statement</FormLabel> <FormControl> <Textarea placeholder="Describe the core problem your project aims to solve." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="role" render={({ field }) => ( <FormItem> <FormLabel>Your Role</FormLabel> <FormControl> <Input placeholder="e.g., UX Designer, Product Manager" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                <Button onClick={() => handleNextStep(0)} disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                                </Button>
                            </div>
                        </StepContent>
                    </Step>

                    <Step index={1}>
                        <StepHeader onClick={() => handleStepClick(1)}>
                            <StepTitle>Output Type</StepTitle>
                        </StepHeader>
                        <StepContent>
                            <div className="space-y-4">
                               <FormField control={form.control} name="output_type" render={({ field }) => ( <FormItem> <FormLabel>What are you creating?</FormLabel> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 max-h-60 overflow-y-auto"> {outputTypes.map((item) => ( <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0"> <FormControl> <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item)); }}/> </FormControl> <FormLabel className="font-normal text-sm">{item}</FormLabel> </FormItem> ))} </div> <FormMessage /> </FormItem> )}/>
                                <Button onClick={() => handleNextStep(1)} disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                                </Button>
                            </div>
                        </StepContent>
                    </Step>

                    <Step index={2}>
                        <StepHeader onClick={() => handleStepClick(2)}>
                            <StepTitle>Desired Outcome</StepTitle>
                        </StepHeader>
                        <StepContent>
                             <div className="space-y-4">
                                <FormField control={form.control} name="outcome" render={({ field }) => ( <FormItem> <FormLabel>What kind of results are you looking for?</FormLabel> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"> {outcomes.map((item) => ( <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0"> <FormControl> <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item)); }}/> </FormControl> <FormLabel className="font-normal text-sm">{item}</FormLabel> </FormItem> ))} </div> <FormMessage /> </FormItem> )}/>
                                <Button onClick={() => handleNextStep(2)} disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                                </Button>
                             </div>
                        </StepContent>
                    </Step>

                    <Step index={3}>
                        <StepHeader onClick={() => handleStepClick(3)}>
                            <StepTitle>Device Type</StepTitle>
                        </StepHeader>
                        <StepContent>
                             <div className="space-y-4">
                                <FormField control={form.control} name="device_type" render={({ field }) => ( <FormItem> <FormLabel>Which devices are you targeting?</FormLabel> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"> {deviceTypes.map((item) => ( <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0"> <FormControl> <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item)); }}/> </FormControl> <FormLabel className="font-normal text-sm">{item}</FormLabel> </FormItem> ))} </div> <FormMessage /> </FormItem> )}/>
                                <Button onClick={() => handleNextStep(3)} disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                                </Button>
                             </div>
                        </StepContent>
                    </Step>

                    <Step index={4}>
                        <StepHeader onClick={() => handleStepClick(4)}>
                            <StepTitle>Project Type</StepTitle>
                        </StepHeader>
                        <StepContent>
                            <div className="space-y-4">
                                <FormField control={form.control} name="project_type" render={({ field }) => ( <FormItem> <FormLabel>Is this a new or existing project?</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-8 pt-2"> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="new" /> </FormControl> <FormLabel className="font-normal text-sm">New Project</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="old" /> </FormControl> <FormLabel className="font-normal text-sm">Existing Project</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
                                <Button onClick={() => handleNextStep(4)} disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Show Recommendations'}
                                </Button>
                            </div>
                        </StepContent>
                    </Step>
                </VerticalStepper>
            </form>
          </Form>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}

const PageSkeleton = () => (
    <main className="container mx-auto max-w-3xl flex-1 p-4 md:p-8">
        <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-9 w-3/5" />
                <Skeleton className="h-4 w-4/5 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    </main>
);


export default function RequirementsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RequirementsPageContent />
    </Suspense>
  )
}
