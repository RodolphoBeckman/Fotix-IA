'use server';
/**
 * @fileOverview Provides AI-powered marketing campaign suggestions based on a product image.
 *
 * - suggestMarketingCampaignIdeas - A function that suggests marketing campaign ideas based on a product image.
 * - SuggestMarketingCampaignIdeasInput - The input type for the suggestMarketingCampaignIdeas function.
 * - SuggestMarketingCampaignIdeasOutput - The return type for the suggestMarketingCampaignIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMarketingCampaignIdeasInputSchema = z.object({
  productImageDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productDescription: z.string().describe('The description of the product.'),
});
export type SuggestMarketingCampaignIdeasInput = z.infer<
  typeof SuggestMarketingCampaignIdeasInputSchema
>;

const SuggestMarketingCampaignIdeasOutputSchema = z.object({
  campaignIdeas: z
    .array(z.string())
    .describe('AI-powered marketing campaign ideas for the product.'),
});
export type SuggestMarketingCampaignIdeasOutput = z.infer<
  typeof SuggestMarketingCampaignIdeasOutputSchema
>;

export async function suggestMarketingCampaignIdeas(
  input: SuggestMarketingCampaignIdeasInput
): Promise<SuggestMarketingCampaignIdeasOutput> {
  return suggestMarketingCampaignIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMarketingCampaignIdeasPrompt',
  input: {schema: SuggestMarketingCampaignIdeasInputSchema},
  output: {schema: SuggestMarketingCampaignIdeasOutputSchema},
  prompt: `You are a marketing expert. Generate creative marketing campaign ideas for the provided product.

Product Description: {{{productDescription}}}
Product Image: {{media url=productImageDataUri}}

Provide a list of marketing campaign ideas to improve product promotion. Each campaign idea should be concise and actionable.
Campaign Ideas:`, // List of campaign ideas
});

const suggestMarketingCampaignIdeasFlow = ai.defineFlow(
  {
    name: 'suggestMarketingCampaignIdeasFlow',
    inputSchema: SuggestMarketingCampaignIdeasInputSchema,
    outputSchema: SuggestMarketingCampaignIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
