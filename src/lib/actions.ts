'use server';

import {
  generateProductDetails,
  type GenerateProductDetailsOutput,
} from '@/ai/flows/generate-product-details';

export async function getAiGeneratedContent(
  imageDataUri: string,
  productDescription?: string
): Promise<
  { success: true; data: GenerateProductDetailsOutput } | { success: false; error: string }
> {
  try {
    const result = await generateProductDetails({
      productPhotoDataUri: imageDataUri,
      productDescription: productDescription,
    });
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
    return {
      success: false,
      error: `Falha ao gerar conteúdo de IA: ${errorMessage}`,
    };
  }
}
