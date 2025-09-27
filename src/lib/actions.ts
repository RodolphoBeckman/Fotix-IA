'use server';

import {
  generateProductDetails,
  type GenerateProductDetailsOutput,
} from '@/ai/flows/generate-product-details';

export async function getAiGeneratedContent(
  imageDataUri: string
): Promise<
  { success: true; data: GenerateProductDetailsOutput } | { success: false; error: string }
> {
  try {
    const result = await generateProductDetails({
      productPhotoDataUri: imageDataUri,
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

export async function fileToDataURI(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}
