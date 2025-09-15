
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { insertRequirement, updateRequirement, fetchRequirementById, type Requirement } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { VerticalStepper, Step } from '@/components/ui/stepper';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Smartphone, Laptop, Plug, Monitor, Save, Eye, Loader2, Target, Info, CircuitBoard, BookOpen, Layers, MessageSquare, Clock, ChevronLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


// Zod schema for validation
const requirementSchema = z.object({
  project_name: z.string().min(1, 'Project name is required.'),
  date: z.union([z.date(), z.string()]),
  problem_statement: z.string().min(1, 'Problem statement is required.'),
  role: z.string().min(1, 'Your role is required.'),
  project_type: z.string({ required_error: 'Please select a project type.' }),
  existing_users: z.string().optional(),
  device_type: z.array(z.string()).min(1, 'Please select at least one device type.'),
  constraints: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  primary_goal: z.array(z.string()).min(1, 'Please select at least one primary goal.'),
  outcome: z.array(z.string()).min(1, 'Please select at least one desired outcome.'),
  output_type: z.array(z.string()).min(1, 'Please select at least one output type.'),
}).refine(data => {
    // If project_type is selected, existing_users must also be selected for the form to be valid.
    if (data.project_type && (data.existing_users === undefined || data.existing_users === null)) {
        return false;
    }
    return true;
}, {
    message: 'Please select an option.',
    path: ['existing_users'],
});

type FormData = z.infer<typeof requirementSchema>;

const deviceTypes = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'desktop', label: 'Desktop', icon: Laptop },
  { id: 'electronics', label: 'Electronics', icon: Plug },
  { id: 'kiosk', label: 'Kiosk', icon: Monitor },
];

const goalTypes = [
    { id: 'adoption', label: 'Adoption', description: 'Create new features, explore new markets' },
    { id: 'task-success', label: 'Task Success', description: 'Boost sign-ups, improve funnels' },
    { id: 'engagement', label: 'Engagement', description: 'Keep users active, reduce churn' },
];

const outcomeTypes = [
  { id: 'qualitative', label: 'Qualitative' },
  { id: 'quantitative', label: 'Quantitative' },
  { id: 'insight', label: 'Insight' },
];

const outputTypes = {
  'Digital Products': [
    { id: 'mobile-app', label: 'Mobile App' },
    { id: 'web-app', label: 'Web App' },
    { id: 'desktop-software', label: 'Desktop Software' },
    { id: 'smartwatch-interface', label: 'Smartwatch Interface' },
    { id: 'tv-or-console-experience', label: 'TV or Console Experience' },
    { id: 'ar-vr-application', label: 'AR/VR Application' },
  ],
  'Research & Strategy': [
    { id: 'storyboards', label: 'Storyboards' },
    { id: 'content-strategy', label: 'Content Strategy' },
    { id: 'kpi-dashboard-analytics-report', label: 'KPI Dashboard / Analytics Report', tooltip: "A visual report tracking Key Performance Indicators (KPIs) and other metrics." },
  ],
  'Design Systems & Assets': [
    { id: 'design-system', label: 'Design System' },
    { id: 'ui-design', label: 'UI Design' },
    { id: 'visual-design', label: 'Visual Design' },
    { id: 'motion-design', label: 'Motion Design' },
    { id: 'animation', label: 'Animation' },
  ],
  'Communication & Media': [
    { id: 'accessibility-audio', label: 'Accessibility Audio' },
    { id: 'chatbot-voice-interface', label: 'Chatbot / Voice Interface' },
    { id: 'voice-interaction', label: 'Voice Interaction' },
    { id: 'presentation', label: 'Presentation' },
    { id: 'video', label: 'Video' },
  ],
};

const constraintTypes = [
  { id: 'limited budget', label: 'Limited Budget' },
  { id: 'tight deadline', label: 'Tight Deadline' },
];

const deadlineOptions = ['1-2 weeks', '3-4 weeks', '1-2 months', '3+ months', 'Custom'];

const categoryIcons: { [key: string]: React.ElementType } = {
  'Digital Products': CircuitBoard,
  'Research & Strategy': BookOpen,
  'Design Systems & Assets': Layers,
  'Communication & Media': MessageSquare,
};

export default function RequirementsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [requirementId, setRequirementId] = useState<string | null>(searchParams.get('id'));
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomDeadline, setShowCustomDeadline] = useState(false);
  const [isBackAlertOpen, setIsBackAlertOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      project_name: '',
      date: new Date(),
      problem_statement: '',
      role: '',
      device_type: [],
      constraints: [],
      deadline: '',
      primary_goal: [],
      outcome: [],
      output_type: [],
    },
  });
  
  const watchedProjectType = form.watch('project_type');
  const watchedConstraints = form.watch('constraints');
  const isTightDeadlineChecked = watchedConstraints?.includes('tight deadline');

  useEffect(() => {
    // If "Tight Deadline" is unchecked, clear the deadline value
    if (!isTightDeadlineChecked) {
      form.setValue('deadline', undefined);
      setShowCustomDeadline(false);
    }
  }, [isTightDeadlineChecked, form]);

  useEffect(() => {
    const requirementIdFromParams = searchParams.get('id');
    if (requirementIdFromParams) {
      const fetchAndSetRequirement = async () => {
        const { data, error } = await fetchRequirementById(requirementIdFromParams);
        if (data) {
          form.reset({
            ...data,
            date: new Date(data.date as string),
            existing_users: data.existing_users === null ? undefined : String(data.existing_users),
            primary_goal: data.primary_goal || [],
            deadline: data.deadline || '',
          } as any);

          if (data.deadline && !deadlineOptions.includes(data.deadline)) {
            setShowCustomDeadline(true);
          }

        } else {
            console.error('Failed to fetch requirement:', error);
            router.push('/requirements');
        }
      };
      fetchAndSetRequirement();
    }
  }, [searchParams, form, router]);

  const steps = [
    { name: 'Project Basics', fields: ['project_name', 'date', 'problem_statement', 'role', 'project_type', 'existing_users'] },
    { name: 'Context', fields: ['device_type', 'constraints', 'deadline'] },
    { name: 'Goals', fields: ['primary_goal', 'outcome'] },
    { name: 'Outputs', fields: ['output_type'] },
  ];

  const handleSaveAndNext = async () => {
    const fieldsToValidate = steps[currentStep].fields as (keyof FormData)[];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setIsSaving(true);
      const allFormData = form.getValues();
      
      const payload: Partial<Requirement> = {};

      // Only include fields from the current step in the payload
      fieldsToValidate.forEach(fieldName => {
          let value = allFormData[fieldName];

          if (fieldName === 'date' && value) {
              value = new Date(value as string | Date).toISOString();
          }
          if (fieldName === 'existing_users') {
              value = value === 'true';
          }
          
          if (value !== undefined) {
             (payload as any)[fieldName] = value;
          }
      });

      let result;
      if (requirementId) {
          result = await updateRequirement(requirementId, payload as Requirement);
      } else {
          result = await insertRequirement(payload as Requirement);
      }

      if (result.error) {
          console.error("Error saving requirement:", result.error);
          toast({ title: 'Save Failed', description: result.error.message || 'Could not save your progress.', variant: 'destructive' });
      } else if (result.data) {
          if (!requirementId) {
            setRequirementId(result.data.id);
            window.history.replaceState(null, '', `?id=${result.data.id}`);
          }
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
      }
      setIsSaving(false);
    }
  };

  const handleShowRecommendations = async () => {
    const isValid = await form.trigger();
    if (isValid && requirementId) {
      router.push(`/requirements/result/${requirementId}`);
    } else if (isValid && !requirementId) {
      // If form is valid but we haven't saved yet (e.g. user fills all steps then clicks 'Show')
      // we need to save first.
      await handleSaveAndNext();
      const finalId = form.getValues().project_name ? requirementId : null; // a bit of a hack to get the new id
      if(requirementId) {
        router.push(`/requirements/result/${requirementId}`);
      } else {
        toast({ title: 'Could not save', description: 'Please try saving the last step first.' });
      }
    }
     else {
      toast({ title: 'Incomplete Form', description: 'Please complete all steps before viewing recommendations.' });
    }
  };

  const handleBackNavigation = () => {
    if (form.formState.isDirty) {
      setIsBackAlertOpen(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleDiscardAndExit = () => {
    router.push('/dashboard');
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <AlertDialog open={isBackAlertOpen} onOpenChange={setIsBackAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave? Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardAndExit}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-border bg-background px-4">
        <Button variant="ghost" size="sm" onClick={handleBackNavigation} className="flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden md:inline">Back to Dashboard</span>
        </Button>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8">
        <FormProvider {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Define Your Project</CardTitle>
                <CardDescription>
                  Answer these questions to get AI-powered UX technique recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VerticalStepper>
                  <Step title="Project Basics" index={0} isActive={currentStep === 0} isCompleted={currentStep > 0}>
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField name="project_name" render={({ field }) => ( <FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField name="date" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={new Date(field.value)} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}/>
                       </div>
                       <FormField name="problem_statement" render={({ field }) => ( <FormItem> <FormLabel>Problem Statement</FormLabel> <FormControl><Textarea {...field} rows={3} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField name="role" render={({ field }) => ( <FormItem> <FormLabel>Your Role</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                       <FormField name="project_type" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>Project Type</FormLabel> <FormControl><RadioGroup onValueChange={(value) => { field.onChange(value); form.setValue('existing_users', undefined, { shouldValidate: false }); }} value={field.value} className="flex gap-4"> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="new" id="new" /></FormControl> <Label htmlFor="new">New Project</Label> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="old" id="existing" /></FormControl> <Label htmlFor="existing">Existing Project</Label> </FormItem> </RadioGroup></FormControl> <FormMessage /> </FormItem> )} />
                       {watchedProjectType && (
                            <FormField name="existing_users" render={({ field }) => ( <FormItem className="space-y-3 p-4 border rounded-md bg-card-nested"> <FormLabel>{watchedProjectType === 'new' ? 'Do you have existing customers to talk to?' : 'Do you have existing users?'}</FormLabel> <FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="true" id="users-yes" /></FormControl> <Label htmlFor="users-yes">Yes</Label> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="false" id="users-no" /></FormControl> <Label htmlFor="users-no">No</Label> </FormItem> </RadioGroup></FormControl> <FormMessage /> </FormItem> )} />
                       )}
                    </div>
                  </Step>
                  <Step title="Context" index={1} isActive={currentStep === 1} isCompleted={currentStep > 1}>
                    <div className="space-y-6">
                        <FormField
                            name="device_type"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-base">Device Type</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {deviceTypes.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="device_type"
                                        render={({ field }) => {
                                            return (
                                            <FormItem key={item.id}>
                                                <FormControl>
                                                <Card
                                                    onClick={() => {
                                                        const currentValue = field.value || [];
                                                        const newValues = currentValue.includes(item.id)
                                                            ? currentValue.filter((id) => id !== item.id)
                                                            : [...currentValue, item.id];
                                                        field.onChange(newValues);
                                                    }}
                                                    className={cn(
                                                        "cursor-pointer transition-all border-2",
                                                        field.value?.includes(item.id) ? "border-primary" : ""
                                                    )}
                                                >
                                                    <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                                                        <item.icon className="h-8 w-8" />
                                                        <span className="font-medium">{item.label}</span>
                                                    </CardContent>
                                                </Card>
                                                </FormControl>
                                            </FormItem>
                                            );
                                        }}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="constraints"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base flex items-center">
                                            Project Constraints
                                        </FormLabel>
                                    </div>
                                    <div className="space-y-4">
                                        {constraintTypes.map((item) => (
                                            <div key={item.id} className={cn("p-4 border rounded-md transition-all", isTightDeadlineChecked && item.id === 'tight deadline' ? 'bg-card-nested' : '')}>
                                                <div className="flex items-center justify-between">
                                                    <FormField
                                                        control={form.control}
                                                        name="constraints"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), item.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal flex items-center gap-2">
                                                                    {item.id === 'tight deadline' && <Clock className="h-4 w-4 text-muted-foreground" />}
                                                                    {item.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                {item.id === 'tight deadline' && isTightDeadlineChecked && (
                                                     <div className="mt-4 pl-8">
                                                        <FormField
                                                            control={form.control}
                                                            name="deadline"
                                                            render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Specify Deadline</FormLabel>
                                                                {showCustomDeadline ? (
                                                                    <FormControl>
                                                                        <Input 
                                                                            placeholder="e.g., End of Q3" 
                                                                            {...field}
                                                                            onBlur={() => { if (!field.value) setShowCustomDeadline(false); }}
                                                                            autoFocus
                                                                        />
                                                                    </FormControl>
                                                                ) : (
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                        if (value === 'Custom') {
                                                                            setShowCustomDeadline(true);
                                                                            field.onChange('');
                                                                        } else {
                                                                            field.onChange(value);
                                                                        }
                                                                        }}
                                                                        value={field.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select a timeframe" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {deadlineOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                                <FormMessage />
                                                            </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  </Step>
                   <Step title="Goals" index={2} isActive={currentStep === 2} isCompleted={currentStep > 2}>
                     <div className="space-y-6">
                        <FormField
                            name="primary_goal"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Project's Primary Goal</FormLabel>
                                    </div>
                                    <div className="space-y-4">
                                        {goalTypes.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="primary_goal"
                                                render={({ field }) => (
                                                <FormItem key={item.id}>
                                                    <FormControl>
                                                        <Card
                                                            onClick={() => {
                                                                const currentValue = field.value || [];
                                                                const newValues = currentValue.includes(item.id)
                                                                    ? currentValue.filter((id) => id !== item.id)
                                                                    : [...currentValue, item.id];
                                                                field.onChange(newValues);
                                                            }}
                                                            className={cn(
                                                                "cursor-pointer transition-all border-2",
                                                                field.value?.includes(item.id) ? "border-primary" : ""
                                                            )}
                                                        >
                                                            <CardContent className="flex items-center p-4 gap-4">
                                                                <Target className="h-6 w-6 text-primary flex-shrink-0" />
                                                                <div>
                                                                    <p className="font-semibold">{item.label}</p>
                                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </FormControl>
                                                </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="outcome"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Desired Outcome</FormLabel>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {outcomeTypes.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="outcome"
                                                render={({ field }) => (
                                                    <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{item.label}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                  </Step>
                  <Step title="Outputs" index={3} isActive={currentStep === 3} isCompleted={currentStep > 3}>
                     <FormField
                        name="output_type"
                        render={() => (
                          <TooltipProvider>
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Desired Output Type(s)</FormLabel>
                                    <FormMessage className="mt-2" />
                                </div>
                                <div className="space-y-4">
                                {Object.entries(outputTypes).map(([category, items]) => {
                                    const Icon = categoryIcons[category];
                                    return (
                                    <div key={category} className="rounded-lg border bg-card-nested p-4">
                                        <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                                            {category}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                            {items.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="output_type"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0 py-1">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(item.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...(field.value || []), item.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== item.id));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="flex items-center gap-2">
                                                                  <FormLabel className="font-normal leading-snug">{item.label}</FormLabel>
                                                                  {item.tooltip && (
                                                                    <Tooltip>
                                                                      <TooltipTrigger asChild>
                                                                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                                      </TooltipTrigger>
                                                                      <TooltipContent>
                                                                        <p>{item.tooltip}</p>
                                                                      </TooltipContent>
                                                                    </Tooltip>
                                                                  )}
                                                                </div>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    );
                                })}
                                </div>
                                <FormMessage />
                            </FormItem>
                          </TooltipProvider>
                        )}
                        />
                  </Step>
                </VerticalStepper>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                 <Button onClick={handleSaveAndNext} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save & Next
                 </Button>
              ) : (
                <Button onClick={handleShowRecommendations} disabled={isSaving}>
                    <Eye className="mr-2 h-4 w-4" />
                    Show Recommendations
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}

    