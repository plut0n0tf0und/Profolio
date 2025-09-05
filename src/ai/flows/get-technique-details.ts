'use server';
/**
 * @fileOverview An AI agent that provides detailed information about a UX technique.
 *
 * - getTechniqueDetails - A function that returns detailed information for a given UX technique name.
 * - TechniqueDetailsInput - The input type for the getTechniqueDetails function.
 * - TechniqueDetailsOutput - The return type for the getTechniqueDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TechniqueDetailsInputSchema = z.object({
  techniqueName: z.string().describe('The name of the UX technique.'),
});
export type TechniqueDetailsInput = z.infer<typeof TechniqueDetailsInputSchema>;

const TechniqueDetailsOutputSchema = z.object({
  overview: z.string().describe('A brief, engaging overview of the UX technique.'),
  prerequisites: z.array(z.string()).describe('A list of prerequisites or things needed before starting.'),
  executionSteps: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
  })).describe('A step-by-step guide to executing the technique.'),
  resourceLinks: z.object({
    create: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
    })).describe('A list of ready-to-use links to create assets for this technique (e.g., survey templates, prototype tools).'),
    guides: z.array(z.object({
      title: z.string(),
      url: z.string().url(),
    })).describe('A list of links to best practices or guides.'),
  }).describe('Helpful links for the user.'),
  effortAndTiming: z.string().describe('An estimation of the effort and time required for this technique.'),
  bestFor: z.array(z.string()).describe('A list of scenarios or situations where this technique is most effective.'),
  tips: z.array(z.string()).describe('A list of actionable tips for getting the most out of this technique.'),
});
export type TechniqueDetailsOutput = z.infer<typeof TechniqueDetailsOutputSchema>;

export async function getTechniqueDetails(input: TechniqueDetailsInput): Promise<TechniqueDetailsOutput> {
  return getTechniqueDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getTechniqueDetailsPrompt',
  input: { schema: TechniqueDetailsInputSchema },
  output: { schema: TechniqueDetailsOutputSchema },
  prompt: `You are a world-class UX research expert and content creator. Your task is to provide a detailed, practical, and easy-to-understand guide for the UX technique: "{{techniqueName}}".

Generate the content based on the following structure. Be concise but comprehensive. Use lists where appropriate. For resource links, provide realistic-looking but placeholder URLs (e.g., https://example.com/template/survey).

**Overview**: A brief, engaging overview of what the technique is and why it's valuable.
**Prerequisites**: What needs to be prepared or defined before starting? (e.g., "Clear research goals", "Target user group defined").
**Execution Steps**: A numbered, step-by-step guide on how to perform the technique. Each step should have a title and a brief description.
**Resource Links**: Provide helpful links.
  - **Create**: Links to templates or tools to get started (e.g., "Survey Template", "Prototype Tool").
  - **Guides**: Links to in-depth articles or best practices.
**Effort & Timing**: A realistic estimate of the time and effort involved (e.g., "Low effort, 1-2 days" or "High effort, 2-3 weeks").
**Best For**: When is this technique most useful? (e.g., "Understanding user motivations", "Validating a new feature concept").
**Tips**: Actionable tips for success.
`,
});

const getTechniqueDetailsFlow = ai.defineFlow(
  {
    name: 'getTechniqueDetailsFlow',
    inputSchema: TechniqueDetailsInputSchema,
    outputSchema: TechniqueDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate technique details.');
    }
    return output;
  }
);
