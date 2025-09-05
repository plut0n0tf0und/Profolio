
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { insertRequirement } from '@/lib/supabaseClient';
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
  VerticalStepper,
  Step,
  StepHeader,
  StepTitle,
  StepContent,
} from '@/components/ui/stepper';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon, RemixIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  project_name: z.string().min(1, 'Project name is required.'),
  date: z.date(),
  problem_statement: z.string().optional(),
  role: z.string().optional(),
  output_type: z.array(z.string()).optional(),
  outcome: z.array(z.string()).optional(),
  device_type: z.array(z.string()).optional(),
  project_type: z.enum(['new', 'old']).optional(),
});

const outputTypes = [
  'Mobile App',
  'Web App',
  'Website',
  'Information Architecture',
  'Wireframe',
  'Prototype',
];
const outcomes = ['Qualitative', 'Quantitative', 'Insight'];
const deviceTypes = ['Mobile', 'Desktop', 'Electronics', 'Kiosk'];

const FiveDProcess = () => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle>5D Design Process</CardTitle>
      <CardDescription>Recommended UX techniques for your project.</CardDescription>
    </CardHeader>
    <CardContent>
      <VerticalStepper>
        {['Discover', 'Define', 'Develop', 'Deliver', 'Deploy'].map(
          (stage, index) => (
            <Step key={stage} index={index} status="completed">
              <StepHeader>
                <StepTitle>{stage}</StepTitle>
              </StepHeader>
              <StepContent>
                <div className="space-y-2 py-2 pl-2">
                  <div className="flex items-center justify-between p-2 rounded-md border">
                    <span>Placeholder Technique</span>
                    <Button variant="ghost" size="sm">
                      <RemixIcon className="mr-2 h-4 w-4" />
                      Remix
                    </Button>
                  </div>
                   <div className="flex items-center justify-between p-2 rounded-md border">
                    <span>Another Technique</span>
                    <Button variant="ghost" size="sm">
                      <RemixIcon className="mr-2 h-4 w-4" />
                      Remix
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          )
        )}
      </VerticalStepper>
    </CardContent>
  </Card>
);

export default function RequirementsPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
      project_type: 'new',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await insertRequirement(values);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success!',
        description: 'Your project requirements have been saved.',
      });
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem saving your requirements.',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <VerticalStepper>
              {/* Step 1: Basic Details */}
              <Step index={0}>
                <StepHeader>
                  <StepTitle>Basic Project Details</StepTitle>
                </StepHeader>
                <StepContent>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="project_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter project name" {...field} />
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
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date('1900-01-01')
                                }
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
                            <Textarea placeholder="Describe the problem your project solves" {...field} />
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
                            <Input placeholder="e.g., UX Designer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </StepContent>
              </Step>
              {/* Step 2: Output Type */}
              <Step index={1}>
                <StepHeader>
                  <StepTitle>Output Type</StepTitle>
                </StepHeader>
                <StepContent>
                  <FormField
                    control={form.control}
                    name="output_type"
                    render={() => (
                      <FormItem className="space-y-3 py-4">
                        {outputTypes.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="output_type"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StepContent>
              </Step>
               {/* Step 3: Outcome */}
              <Step index={2}>
                <StepHeader>
                  <StepTitle>Outcome</StepTitle>
                </StepHeader>
                <StepContent>
                   <FormField
                    control={form.control}
                    name="outcome"
                    render={() => (
                      <FormItem className="space-y-3 py-4">
                        {outcomes.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="outcome"
                            render={({ field }) => (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              )
                            }
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StepContent>
              </Step>
                {/* Step 4: Device Type */}
              <Step index={3}>
                <StepHeader>
                  <StepTitle>Device Type</StepTitle>
                </StepHeader>
                <StepContent>
                    <FormField
                    control={form.control}
                    name="device_type"
                    render={() => (
                      <FormItem className="space-y-3 py-4">
                        {deviceTypes.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="device_type"
                            render={({ field }) => (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              )
                            }
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </StepContent>
              </Step>
               {/* Step 5: Project Type */}
              <Step index={4} isLastStep>
                <StepHeader>
                  <StepTitle>Project Type</StepTitle>
                </StepHeader>
                <StepContent>
                   <FormField
                      control={form.control}
                      name="project_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3 py-4">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="new" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  New Project
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="old" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Existing Project
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </StepContent>
              </Step>
            </VerticalStepper>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
               {form.formState.isSubmitting ? 'Saving...' : 'Show Recommendations'}
            </Button>
          </form>
        </Form>
        
        {isSubmitted && <FiveDProcess />}
      </div>
    </div>
  );
}

const RemixIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2zM9.5 8.5l1.5 1.5-1.5 1.5zm4 0l1.5 1.5-1.5 1.5z" />
  </svg>
);
