import { AuthForm } from '@/components/auth-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight font-headline">
          Welcome to AuthNexus
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          The future of secure and seamless authentication.
        </p>
        <div className="mt-6">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
