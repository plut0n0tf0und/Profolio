'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GithubIcon, GoogleIcon } from '@/components/icons';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordStrengthInput } from './password-strength-input';

// This is a placeholder for your Firebase configuration.
// In a real application, you would initialize Firebase here
// and use the actual Firebase Auth methods.
// e.g., import { auth } from '@/lib/firebase';
const firebaseAuth = {
  signInWithGoogle: async () => {
    console.log('Signing in with Google');
    // Simulate a successful login
    return { user: { email: 'user@google.com' } };
  },
  signInWithGithub: async () => {
    console.log('Signing in with GitHub');
    // Simulate a successful login
    return { user: { email: 'user@github.com' } };
  },
  signInWithEmail: async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    // Simulate a failure for a common test password
    if (password === 'password') throw new Error('Invalid credentials');
    // Simulate success for other passwords
    return { user: { email } };
  },
  signUpWithEmail: async (email: string, password: string) => {
    console.log('Signing up with email:', email, 'and password:', password);
    // Simulate a successful signup
    return { user: { email } };
  },
};

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signUpSchema = z
  .object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export function AuthForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSocialLoginPending, setSocialLoginPending] = useState<string | null>(
    null
  );

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      try {
        await firebaseAuth.signInWithEmail(values.email, values.password);
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        // Here you would typically redirect the user to a dashboard page
        // e.g., router.push('/dashboard');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description:
            (error as Error).message || 'An unexpected error occurred.',
        });
      }
    });
  };

  const onSignUpSubmit = (values: z.infer<typeof signUpSchema>) => {
    startTransition(async () => {
      try {
        await firebaseAuth.signUpWithEmail(values.email, values.password);
        toast({
          title: 'Sign Up Successful',
          description:
            'Welcome! Please check your email to verify your account.',
        });
        // Here you would typically redirect the user or switch to the login tab
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description:
            (error as Error).message || 'An unexpected error occurred.',
        });
      }
    });
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setSocialLoginPending(provider);
    startTransition(async () => {
      try {
        const authProvider =
          provider === 'google'
            ? firebaseAuth.signInWithGoogle
            : firebaseAuth.signInWithGithub;
        await authProvider();
        toast({
          title: 'Login Successful',
          description: `Welcome via ${provider}!`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description:
            (error as Error).message || `Failed to sign in with ${provider}.`,
        });
      } finally {
        setSocialLoginPending(null);
      }
    });
  };

  return (
    <Card className="w-full">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="login">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Button asChild variant="link" className="ml-auto h-auto p-0 text-sm font-normal text-primary hover:underline">
                          <a href="#">Forgot password?</a>
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Log In
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="signup">
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => <PasswordStrengthInput field={field} />}
                />
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      <div className="relative px-6 pb-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <CardFooter className="flex gap-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('google')}
          disabled={!!isSocialLoginPending}
        >
          {isSocialLoginPending === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-5 w-5" />
          )}
          Google
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleSocialLogin('github')}
          disabled={!!isSocialLoginPending}
        >
          {isSocialLoginPending === 'github' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GithubIcon className="mr-2 h-5 w-5" />
          )}
          GitHub
        </Button>
      </CardFooter>
    </Card>
  );
}
