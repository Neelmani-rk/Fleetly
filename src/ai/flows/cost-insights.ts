'use server';

/**
 * @fileOverview An AI agent that provides cost insights for fleet management.
 *
 * - getCostInsights - A function that analyzes cost changes and suggests the lowest-cost solution.
 * - CostInsightsInput - The input type for the getCostInsights function.
 * - CostInsightsOutput - The return type for the getCostInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostInsightsInputSchema = z.object({
  currentCost: z.number().describe('The current total cost of the fleet operations.'),
  newCost: z.number().describe('The new total cost after policy changes.'),
  policyChanges: z.string().describe('A description of the policy changes made.'),
  availableVehicles: z.string().describe('A summary of the available vehicles (owned and rental).'),
  rentalScenarios: z.string().describe('Cost breakdown for various rental scenarios.'),
});
export type CostInsightsInput = z.infer<typeof CostInsightsInputSchema>;

const CostInsightsOutputSchema = z.object({
  suggestion: z.string().describe('The AI-powered suggestion for the lowest-cost solution.'),
  reasoning: z.string().describe('The plain-English reasoning behind the suggestion.'),
});
export type CostInsightsOutput = z.infer<typeof CostInsightsOutputSchema>;

export async function getCostInsights(input: CostInsightsInput): Promise<CostInsightsOutput> {
  return costInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costInsightsPrompt',
  input: {schema: CostInsightsInputSchema},
  output: {schema: CostInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in fleet management cost optimization.

You are given the current cost, the new cost after policy changes, a description of the policy changes, available vehicles, and rental scenarios.

Based on this information, provide a suggestion for the lowest-cost solution and explain your reasoning in plain English.

Current Cost: {{{currentCost}}}
New Cost: {{{newCost}}}
Policy Changes: {{{policyChanges}}}
Available Vehicles: {{{availableVehicles}}}
Rental Scenarios: {{{rentalScenarios}}}

Suggest the lowest-cost solution and explain your reasoning:
Suggestion: 
Reasoning: `,
});

const costInsightsFlow = ai.defineFlow(
  {
    name: 'costInsightsFlow',
    inputSchema: CostInsightsInputSchema,
    outputSchema: CostInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
      console.warn("AI failed to generate cost insights. Returning fallback.");
      return {
        suggestion: "Could not generate an AI suggestion at this time.",
        reasoning: "The AI model did not return a response. This could be a temporary issue. Please try again in a few moments."
      };
    }
    
    return output;
  }
);
