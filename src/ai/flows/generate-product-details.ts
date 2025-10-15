'use server';

/**
 * @fileOverview Gera detalhes de produtos (título, descrição, tags de SEO) com base em uma imagem de produto enviada e uma descrição opcional.
 *
 * - generateProductDetails - Uma função que lida com a geração de detalhes do produto.
 * - GenerateProductDetailsInput - O tipo de entrada para a função generateProductDetails.
 * - GenerateProductDetailsOutput - O tipo de retorno para a função generateProductDetails.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDetailsInputSchema = z.object({
  productPhotoDataUri: z
    .string()
    .describe(
      "Uma foto do produto, como um URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productDescription: z
    .string()
    .optional()
    .describe('Uma descrição textual opcional da peça de roupa.'),
});
export type GenerateProductDetailsInput = z.infer<typeof GenerateProductDetailsInputSchema>;

const GenerateProductDetailsOutputSchema = z.object({
  title: z.string().describe('O título do produto.'),
  description: z.string().describe('A descrição do produto.'),
  seoTags: z.array(z.string()).describe('Tags de SEO para o produto.'),
});
export type GenerateProductDetailsOutput = z.infer<typeof GenerateProductDetailsOutputSchema>;

export async function generateProductDetails(
  input: GenerateProductDetailsInput
): Promise<GenerateProductDetailsOutput> {
  return generateProductDetailsFlow(input);
}

const generateProductDetailsFlow = ai.defineFlow(
  {
    name: 'generateProductDetailsFlow',
    inputSchema: GenerateProductDetailsInputSchema,
    outputSchema: GenerateProductDetailsOutputSchema,
  },
  async input => {
    let basePrompt = `Você é um assistente de IA especialista em criar conteúdo para e-commerce de moda.

Com base na imagem do produto e na descrição fornecida, gere um título, uma descrição de marketing atraente e uma lista de tags de SEO.

A imagem deve servir como contexto visual.`;

    if (input.productDescription) {
      basePrompt += `\n\nUse a descrição fornecida como a principal fonte de verdade:\nDescrição Fornecida: ${input.productDescription}`;
    }

    const prompt = ai.definePrompt({
      name: 'generateProductDetailsPrompt',
      input: {schema: GenerateProductDetailsInputSchema},
      output: {schema: GenerateProductDetailsOutputSchema},
      prompt: `${basePrompt}\n\nImagem do Produto: {{media url=productPhotoDataUri}}`,
    });
    
    const {output} = await prompt(input);
    return output!;
  }
);
