
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchRemixedTechniqueById, RemixedTechnique } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PortfolioSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/4" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/5" />
            <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/5" />
            <Skeleton className="h-16 w-full" />
        </div>
    </div>
);


export default function PortfolioPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const id = params.id as string;

    const [technique, setTechnique] = useState<RemixedTechnique | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (!id) return;

        const getTechniqueDetails = async () => {
            setIsLoading(true);
            const { data, error } = await fetchRemixedTechniqueById(id);
            if (error || !data) {
                toast({ title: 'Error', description: 'Failed to load portfolio details.', variant: 'destructive' });
                router.push('/dashboard');
            } else {
                setTechnique(data);
                // AI generation will happen here in the next step
            }
            setIsLoading(false);
        };
        getTechniqueDetails();
    }, [id, router, toast]);
    
    const handleExport = () => {
        // PDF/PNG export logic will go here
        toast({ title: 'Coming Soon!', description: 'Export functionality will be implemented soon.'});
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="hidden md:inline">Back to Editor</span>
                </Button>
                <h1 className="text-xl font-bold text-center flex-1 truncate">
                    Portfolio Preview
                </h1>
                <div className="w-40 flex justify-end">
                    <Button onClick={handleExport} disabled={isLoading || isGenerating}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl p-4 md:p-8">
                {isLoading ? (
                    <PortfolioSkeleton />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">{technique?.technique_name}</CardTitle>
                             <CardDescription>
                                A portfolio-ready summary of your work.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isGenerating ? (
                                <div className="flex flex-col items-center justify-center gap-4 p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-muted-foreground">AI is generating your portfolio...</p>
                                </div>
                            ) : (
                                <div>
                                    <p>AI-generated content will be displayed here.</p>
                                    <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto text-xs">
                                        {JSON.stringify(technique, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}

    