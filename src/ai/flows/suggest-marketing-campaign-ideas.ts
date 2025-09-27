'use server';
/**
 * @fileOverview Fornece sugestões de campanhas de marketing com IA com base na imagem de um produto.
 *
 * - suggestMarketingCampaignIdeas - Uma função que sugere ideias de campanhas de marketing com base na imagem de um produto.
 * - SuggestMarketingCampaignIdeasInput - O tipo de entrada para a função suggestMarketingCampaignIdeas.
 * - SuggestMarketingCampaignIdeasOutput - O tipo de retorno para a função suggestMarketingCampaignIdeas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMarketingCampaignIdeasInputSchema = z.object({
  productImageDataUri: z
    .string()
    .describe(
      "Uma foto de um produto, como um URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productDescription: z.string().describe('A descrição do produto.'),
});
export type SuggestMarketingCampaignIdeasInput = z.infer<
  typeof SuggestMarketingCampaignIdeasInputSchema
>;

const SuggestMarketingCampaignIdeasOutputSchema = z.object({
  campaignIdeas: z
    .array(z.string())
    .describe('Ideias de campanhas de marketing geradas por IA para o produto.'),
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
  prompt: `Você é um especialista em marketing. Gere ideias criativas de campanhas de marketing para o produto fornecido.

Descrição do Produto: {{{productDescription}}}
Imagem do Produto: {{media url=productImageDataUri}}

Forneça uma lista de ideias de campanhas de marketing para melhorar a promoção do produto. Cada ideia de campanha deve ser concisa e acionável.
Ideias de Campanha:`, // Lista de ideias de campanha
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
