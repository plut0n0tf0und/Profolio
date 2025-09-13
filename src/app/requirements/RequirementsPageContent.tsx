
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
import { CalendarIcon, Smartphone, Laptop, Plug, Monitor, Save, Eye, Loader2, Coins, Workflow } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Zod schema for validation
const requirementSchema = z.object({
  project_name: z.string().min(1, 'Project name is required.'),
  date: z.union([z.date(), z.string()]),
  problem_statement: z.string().min(1, 'Problem statement is required.'),
  role: z.string().min(1, 'Your role is required.'),
  project_type: z.string({ required_error: 'Please select a project type.' }),
  existing_users: z.string({ required_error: 'Please specify if you have existing users.' }),
  device_type: z.array(z.string()).min(1, 'Please select at least one device type.'),
  constraints: z.array(z.string()).optional(),
  primary_goal: z.array(z.string()).min(1, 'Please select at least one primary goal.'),
  outcome: z.array(z.string()).min(1, 'Please select at least one desired outcome.'),
  output_type: z.array(z.string()).min(1, 'Please select at least one output type.'),
});

type FormData = z.infer<typeof requirementSchema>;

const deviceTypes = [
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="h-8 w-8" /> },
  { id: 'desktop', label: 'Desktop', icon: <Laptop className="h-8 w-8" /> },
  { id: 'electronics', label: 'Electronics', icon: <Plug className="h-8 w-8" /> },
  { id: 'kiosk', label: 'Kiosk', icon: <Monitor className="h-8 w-8" /> },
];

const goalTypes = [
    { id: 'innovation & growth', label: 'Innovation & Growth'},
    { id: 'optimization & conversion', label: 'Optimization & Conversion' },
    { id: 'retention & engagement', label: 'Retention & Engagement' },
];

const outcomeTypes = [
  { id: 'qualitative', label: 'Qualitative' },
  { id: 'quantitative', label: 'Quantitative' },
  { id: 'insight', label: 'Insight' },
];

const outputTypes = {
  "Digital Products": [
    { id: "mobile app", label: "Mobile App" },
    { id: "web app", label: "Web App" },
    { id: "desktop software", label: "Desktop Software" },
    { id: "smartwatch interface", label: "Smartwatch Interface" },
    { id: "tv or console experience", label: "TV or Console Experience" },
    { id: "ar/vr application", label: "AR/VR Application" },
  ],
  "Research & Strategy": [
    { id: "service blueprint", label: "Service Blueprint" },
    { id: "journey map", label: "Journey Map" },
    { id: "persona profile", label: "Persona Profile" },
    { id: "usability report", label: "Usability Report" },
    { id: "storyboards", label: "Storyboards" },
    { id: "content strategy", label: "Content Strategy" },
    { id: "kpi dashboard / analytics report", label: "KPI Dashboard / Analytics Report" },
  ],
  "Design Systems & Assets": [
    { id: "design system", label: "Design System" },
    { id: "ui design", label: "UI Design" },
    { id: "wireframe", label: "Wireframe" },
    { id: "information architecture", label: "Information Architecture" },
    { id: "visual design", label: "Visual Design" },
    { id: "motion design", label: "Motion Design" },
    { id: "animation", label: "Animation" },
    { id: "interactive prototype", label: "Interactive Prototype" },
  ],
  "Communication & Media": [
    { id: "accessibility audit", label: "Accessibility Audit" },
    { id: "chatbot / voice interface", label: "Chatbot / Voice Interface" },
    { id: "voice interaction", label: "Voice Interaction" },
    { id: "presentation", label: "Presentation" },
    { id: "video", label: "Video" },
  ],
};


const constraintTypes = [
  { id: 'limited budget', label: 'Limited Budget', icon: <Coins className="h-4 w-4 text-muted-foreground" /> },
  { id: 'tight deadline', label: 'Tight Deadline', icon: <Workflow className="h-4 w-4 text-muted-foreground" /> },
];

export default function RequirementsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [requirementId, setRequirementId] = useState<string | null>(searchParams.get('id'));
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      project_name: '',
      date: new Date(),
      problem_statement: '',
      role: '',
      project_type: 'new',
      existing_users: 'false',
      device_type: [],
      constraints: [],
      primary_goal: [],
      outcome: [],
      output_type: [],
    },
  });

  useEffect(() => {
    const requirementIdFromParams = searchParams.get('id');
    if (requirementIdFromParams) {
      const fetchAndSetRequirement = async () => {
        const { data, error } = await fetchRequirementById(requirementIdFromParams);
        if (data) {
          form.reset({
            ...data,
            project_name: data.project_name || '',
            problem_statement: data.problem_statement || '',
            role: data.role || '',
            project_type: data.project_type === 'old' ? 'existing' : (data.project_type || 'new'),
            date: new Date(data.date as string),
            existing_users: data.existing_users === null ? 'false' : String(data.existing_users),
            primary_goal: data.primary_goal || [],
            device_type: data.device_type || [],
            outcome: data.outcome || [],
            output_type: data.output_type || [],
            constraints: data.constraints || [],
          });
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
    { name: 'Context', fields: ['device_type', 'constraints'] },
    { name: 'Goals', fields: ['primary_goal', 'outcome'] },
    { name: 'Outputs', fields: ['output_type'] },
  ];

  const handleSaveAndNext = async () => {
    const fieldsToValidate = steps[currentStep].fields as (keyof FormData)[];
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setIsSaving(true);
      const formData = form.getValues();
      const payload: Partial<Requirement> = {
          ...formData,
          date: new Date(formData.date).toISOString(),
          existing_users: formData.existing_users === 'true',
      };

      let result;
      if (requirementId) {
          result = await updateRequirement(requirementId, payload as Requirement);
      } else {
          result = await insertRequirement(payload as Requirement);
      }

      if (result.error) {
          toast({ title: 'Save Failed', description: 'Could not save your progress.', variant: 'destructive' });
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
      // Final save before navigating
      await handleSaveAndNext();
      router.push(`/requirements/result/${requirementId}`);
    } else if (!isValid) {
      toast({ title: 'Incomplete Form', description: 'Please complete all steps before viewing recommendations.' });
    } else if (!requirementId) {
      toast({ title: 'Save Required', description: 'Please save your progress on the first step.' });
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
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
                       <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <FormField name="project_type" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>Project Type</FormLabel> <FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="new" id="new" /></FormControl> <Label htmlFor="new">New Project</Label> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="existing" id="existing" /></FormControl> <Label htmlFor="existing">Existing Project</Label> </FormItem> </RadioGroup></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField name="existing_users" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>Existing Users</FormLabel> <FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="true" id="users-yes" /></FormControl> <Label htmlFor="users-yes">Yes</Label> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl><RadioGroupItem value="false" id="users-no" /></FormControl> <Label htmlFor="users-no">No</Label> </FormItem> </RadioGroup></FormControl> <FormMessage /> </FormItem> )} />
                       </div>
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
                                                        {item.icon}
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
                                            <span className="ml-2 text-sm font-normal text-muted-foreground">(Optional)</span>
                                        </FormLabel>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {constraintTypes.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="constraints"
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
                                                        <FormLabel className="font-normal flex items-center gap-2">
                                                            {item.icon}
                                                            {item.label}
                                                        </FormLabel>
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
                   <Step title="Goals" index={2} isActive={currentStep === 2} isCompleted={currentStep > 2}>
                    <div className="space-y-8">
                      <FormField
                        name="primary_goal"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Project's Primary Goal(s)</FormLabel>
                              <FormMessage className="mt-2" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {goalTypes.map((item) => (
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
                                        "cursor-pointer transition-all border-2 flex items-center p-4",
                                        field.value?.includes(item.id) ? "border-primary" : ""
                                      )}
                                    >
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        className="mr-4 h-5 w-5"
                                        disabled={true}
                                      />
                                      <span className="font-medium">{item.label}</span>
                                    </Card>
                                  </FormControl>
                                </FormItem>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="outcome"
                        control={form.control}
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Desired Outcome</FormLabel>
                              <FormMessage className="mt-2" />
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
                          </FormItem>
                        )}
                      />
                    </div>
                  </Step>
                  <Step title="Outputs" index={3} isActive={currentStep === 3} isCompleted={currentStep > 3}>
                     <FormField
                        name="output_type"
                        render={({ field }) => (
                            <FormItem>
                                <div className="mb-4">
                                    <FormLabel className="text-base">Desired Output Type(s)</FormLabel>
                                    <FormMessage className="mt-2" />
                                </div>
                                <div className="space-y-4">
                                {Object.entries(outputTypes).map(([category, items]) => (
                                    <div key={category}>
                                        <h3 className="font-semibold mb-2">{category}</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {items.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="output_type"
                                                    render={({ field }) => {
                                                        return (
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
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </FormItem>
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
      </div>
    </div>
  );
}

    