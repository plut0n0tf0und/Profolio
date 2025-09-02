import { AuthForm } from '@/components/auth-form';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg md:grid-cols-2 bg-card shadow-lg">
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl lg:text-6xl font-headline">
            AuthNexus
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Experience the future of secure, seamless authentication powered by AI.
          </p>
          <div className="mt-8">
            <AuthForm />
          </div>
        </div>
        <div className="relative hidden h-full md:block">
           <Image
            src="https://picsum.photos/800/1200"
            alt="Abstract art representing security and technology"
            fill
            className="object-cover"
            data-ai-hint="abstract technology"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent md:bg-gradient-to-r"></div>
        </div>
      </div>
    </main>
  );
}
