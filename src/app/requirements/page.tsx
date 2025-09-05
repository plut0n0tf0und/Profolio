
'use client';

import { useState, useEffect } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
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
import { CalendarIcon, Loader2, ChevronLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

const sectionSchemas = {
  'item-1': formSchema.pick({ project_name: true, date: true, problem_statement: true, role: true }),
  'item-2': formSchema.pick({ output_type: true }),
  'item-3': formSchema.pick({ outcome: true }),
  'item-4': formSchema.pick({ device_type: true }),
  'item-5': formSchema.pick({ project_type: true }),
};


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

const accordionItems = ['item-1', 'item-2', 'item-3', 'item-4', 'item-5'];

export default function RequirementsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeAccordionItem, setActiveAccordionItem] = useState('item-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementId, setRequirementId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
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
    if (id) {
      setRequirementId(id);
      const loadRequirement = async () => {
        setIsSubmitting(true);
        const { data, error } = await fetchRequirementById(id);
        if (error) {
          toast({
            title: 'Failed to load project',
            description: 'Could not fetch existing project details.',
            className: 'px-3 py-2 text-sm border border-neutral-300 bg-neutral-50 text-neutral-900 rounded-lg shadow-md',
          });
        } else if (data) {
          form.reset({
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
            output_type: data.output_type || [],
            outcome: data.outcome || [],
            device_type: data.device_type || [],
          });
          toast({
            title: 'Project Loaded',
            description: 'You are now editing an existing project.',
          });
        }
        setIsSubmitting(false);
      };
      loadRequirement();
    }
  }, [searchParams, form, toast]);


  const handleSaveAndNext = async (currentSection: keyof typeof sectionSchemas) => {
    setIsSubmitting(true);
    
    const fieldsToValidate = Object.keys(sectionSchemas[currentSection].shape) as (keyof z.infer<typeof formSchema>)[];
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields for this section.',
        className: 'px-3 py-2 text-sm border border-neutral-300 bg-neutral-50 text-neutral-900 rounded-lg shadow-md',
      });
      setIsSubmitting(false);
      return;
    }

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
        const { data, error } = await insertRequirement(sectionData);
        if (error) throw error;
        savedData = data;
        if (savedData?.id) {
          setRequirementId(savedData.id);
        }
      }

      toast({
        title: 'Progress Saved!',
        description: `Section has been successfully saved.`,
      });

      const currentIndex = accordionItems.indexOf(currentSection);
      if (currentIndex < accordionItems.length - 1) {
        setActiveAccordionItem(accordionItems[currentIndex + 1]);
      } else {
        if (savedData?.id) {
            router.push(`/requirements/result/${savedData.id}`);
        } else {
            throw new Error("Could not find requirement ID to show results.");
        }
      }
    } catch (error: any) {
      toast({
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem saving your requirements.',
        className: 'px-3 py-2 text-sm border border-neutral-300 bg-neutral-50 text-neutral-900 rounded-lg shadow-md',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFinalSubmit = () => {
    if (!requirementId) {
      toast({
        title: 'Cannot Proceed',
        description: 'Please save the final section to view recommendations.',
        className: 'px-3 py-2 text-sm border border-neutral-300 bg-neutral-50 text-neutral-900 rounded-lg shadow-md',
      });
      return;
    }
    router.push(`/requirements/result/${requirementId}`);
  };


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
        </div>
        <h1 className="ml-4 text-xl font-bold">Define Project</h1>
      </header>
      <main className="container mx-auto max-w-2xl p-4 py-8 md:p-8">
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
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-4"
                value={activeAccordionItem}
                onValueChange={setActiveAccordionItem}
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-xl font-semibold">
                    1. Basic Project Details
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                     <FormField
                      control={form.control}
                      name="project_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., AuthNexus Redesign" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="problem_statement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Problem Statement</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe the core problem your project aims to solve." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., UX Designer, Product Manager" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button onClick={() => handleSaveAndNext('item-1')} disabled={isSubmitting} className="w-full">
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-xl font-semibold">2. Output Type</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="output_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What are you creating?</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 max-h-60 overflow-y-auto">
                            {outputTypes.map((item) => (
                              <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button onClick={() => handleSaveAndNext('item-2')} disabled={isSubmitting} className="w-full">
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-xl font-semibold">3. Desired Outcome</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="outcome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What kind of results are you looking for?</FormLabel>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            {outcomes.map((item) => (
                               <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <Button onClick={() => handleSaveAndNext('item-3')} disabled={isSubmitting} className="w-full">
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="item-4">
                  <AccordionTrigger className="text-xl font-semibold">4. Device Type</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="device_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which devices are you targeting?</FormLabel>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            {deviceTypes.map((item) => (
                              <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button onClick={() => handleSaveAndNext('item-4')} disabled={isSubmitting} className="w-full">
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save & Next'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="item-5">
                  <AccordionTrigger className="text-xl font-semibold">5. Project Type</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                     <FormField
                      control={form.control}
                      name="project_type"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Is this a new or existing project?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-8 pt-2"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="new" />
                                </FormControl>
                                <FormLabel className="font-normal">New Project</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="old" />
                                </FormControl>
                                <FormLabel className="font-normal">Existing Project</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button onClick={() => handleSaveAndNext('item-5')} disabled={isSubmitting} className="w-full">
                       {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Show Recommendations'}
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </Form>
        </CardContent>
      </Card>
      </main>
    </div>
  );
}
