
'use server';

/**
 * @fileOverview AI agent that analyzes open 'partes' to estimate resource allocation across ongoing projects and recommends course corrections.
 *
 * - analyzeResourceAllocation - A function that handles the resource allocation analysis process.
 * - AnalyzeResourceAllocationInput - The input type for the analyzeResourceAllocation function.
 * - AnalyzeResourceAllocationOutput - The return type for the analyzeResourceAllocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResourceAllocationInputSchema = z.object({
  partesData: z
    .string()
    .describe("JSON string containing an array of open 'partes' (work orders) with details like project ID, tasks, assigned worker, etc."),
});
export type AnalyzeResourceAllocationInput = z.infer<typeof AnalyzeResourceAllocationInputSchema>;

const AnalyzeResourceAllocationOutputSchema = z.object({
  resourceAllocationSuggestion: z.string().describe('A suggestion for resource allocation across ongoing projects to avoid bottlenecks.'),
  reasoning: z.string().describe('The AI’s reasoning behind the resource allocation suggestion.'),
});
export type AnalyzeResourceAllocationOutput = z.infer<typeof AnalyzeResourceAllocationOutputSchema>;

export async function analyzeResourceAllocation(input: AnalyzeResourceAllocationInput): Promise<AnalyzeResourceAllocationOutput> {
  return analyzeResourceAllocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResourceAllocationPrompt',
  input: {schema: AnalyzeResourceAllocationInputSchema},
  output: {schema: AnalyzeResourceAllocationOutputSchema},
  prompt: `You are an AI assistant specializing in construction project management. Your task is to analyze open work orders (partes) and provide recommendations for resource allocation to prevent bottlenecks.

  Analyze the following data:
  {{partesData}}

  Based on this data, provide a resource allocation suggestion and explain your reasoning. Your response should be in Spanish.
  Format your response as follows:

  Suggestion: [Your resource allocation suggestion]
  Reasoning: [Your detailed reasoning behind the suggestion] `,
});

const analyzeResourceAllocationFlow = ai.defineFlow(
  {
    name: 'analyzeResourceAllocationFlow',
    inputSchema: AnalyzeResourceAllocationInputSchema,
    outputSchema: AnalyzeResourceAllocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
