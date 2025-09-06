
'use server';
/**
 * @fileOverview An AI agent that generates a comprehensive portfolio from all of a user's remixed techniques.
 *
 * - generateFullPortfolio - A function that returns a structured portfolio aggregating all techniques.
 * - FullPortfolioInput - The input type for the generateFullPortfolio function.
 * - FullPortfolioOutput - The return type for the generateFullPortfolio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { RemixedTechnique } from '@/lib/supabaseClient';

const FullPortfolioInputSchema = z.array(z.object({
    project_id: z.string().nullable().optional(),
    project_name: z.string(),
    technique_name: z.string(),
    date: z.string().optional(),
    duration: z.string().optional(),
    teamSize: z.string().optional(),
    why: z.string().optional(),
    overview: z.string().optional(),
    problemStatement: z.string().optional(),
    role: z.string().optional(),
    prerequisites: z.array(z.object({ text: z.string(), checked: z.boolean() })).optional(),
    executionSteps: z.array(z.object({ text: z.string(), checked: z.boolean() })).optional(),
}));

export type FullPortfolioInput = z.infer<typeof FullPortfolioInputSchema>;

const ProjectPortfolioSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  tags: z.array(z.string()).describe('A list of relevant tags or keywords for the entire project, like "Wireframe", "Quantitative", "Mobile".'),
  meta: z.object({
    date: z.string().describe('The overall date range of the project work.'),
    duration: z.string().describe('The total duration of all work.'),
    teamSize: z.string().describe('The size of the team involved.'),
    role: z.string().describe('The user\'s primary role in this project.'),
  }),
  whyAndProblem: z.string().describe("A concise, professionally rewritten paragraph combining the 'why' and 'problem statement' from all techniques in this project."),
  introduction: z.string().describe("A compelling summary of the project's purpose and the user's high-level involvement."),
  approach: z.string().describe("A professionally written, high-level summary of the overall approach taken. This should synthesize the key activities from prerequisites and execution steps from all techniques into a narrative, not a list. Mention key methods like 'user interviews', 'sitemapping', and 'usability testing' where applicable."),
  impactOnDesign: z.string().describe("A professionally written paragraph summarizing the combined impact of all techniques on the project's final design and outcomes."),
});


const FullPortfolioOutputSchema = z.object({
  projects: z.array(ProjectPortfolioSchema),
});
export type FullPortfolioOutput = z.infer<typeof FullPortfolioOutputSchema>;

// The input to this function will be slightly different from the AI flow's input
// as we need to associate project names.
export type EnrichedRemixedTechnique = RemixedTechnique & { project_name: string };

export async function generateFullPortfolio(input: EnrichedRemixedTechnique[]): Promise<FullPortfolioOutput> {
  const flowInput: FullPortfolioInput = input.map(item => ({
    project_id: item.project_id,
    project_name: item.project_name,
    technique_name: item.technique_name,
    date: item.date,
    duration: item.duration,
    teamSize: item.teamSize,
    why: item.why,
    overview: item.overview,
    problemStatement: item.problemStatement,
    role: item.role,
    prerequisites: item.prerequisites,
    executionSteps: item.executionSteps,
  }));
  return generateFullPortfolioFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'generateFullPortfolioPrompt',
  input: { schema: z.object({ inputJsonString: z.string() }) },
  output: { schema: FullPortfolioOutputSchema },
  prompt: `You are a world-class UX portfolio writer. Your task is to transform a collection of a user's raw notes about various UX projects and techniques into a single, polished, professional portfolio document.

You will receive a JSON string representing an array of 'remixed techniques'. Each technique is associated with a project. You must group these techniques by 'project_name' and generate a cohesive case study for each project.

Here is the user's data:
{{{inputJsonString}}}

Follow these instructions carefully for each project group:
1.  **projectName**: Use the project's name.
2.  **tags**: Infer a set of relevant tags for the entire project based on all techniques used.
3.  **meta**: Synthesize the project-level metadata. For date and duration, try to create a reasonable aggregate. Use the most common role.
4.  **whyAndProblem**: Combine the 'why' and 'problemStatement' from all techniques into one clear, professional paragraph.
5.  **introduction**: Write a powerful introduction summarizing the project's purpose and your role.
6. **approach**: Write a professionally written, high-level summary of the overall approach taken in a single paragraph. This should synthesize the key activities from prerequisites and execution steps from ALL techniques into a fluid narrative. Do NOT use a list. For example, mention key methods like "Conducted user interviews to define personas, which informed the creation of new wireframes and a clickable prototype for usability testing."
7. **impactOnDesign**: Write a professional paragraph summarizing the combined impact of all techniques on the project's final design and outcomes.

Ensure all descriptions of actions and outcomes are written in the past tense. The final output must be a single JSON object containing a list of these structured project portfolios.
`,
});

const generateFullPortfolioFlow = ai.defineFlow(
  {
    name: 'generateFullPortfolioFlow',
    inputSchema: FullPortfolioInputSchema,
    outputSchema: FullPortfolioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
      inputJsonString: JSON.stringify(input, null, 2)
    });
    if (!output) {
      throw new Error('Failed to generate full portfolio.');
    }
    return output;
  }
);
