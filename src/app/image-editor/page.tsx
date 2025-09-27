'use client';

import type { GenerateProductDetailsOutput } from '@/ai/flows/generate-product-details';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fileToDataURI, getAiGeneratedContent } from '@/lib/actions';
import {
  processImage,
  type Dimension,
  type ProcessedImage,
} from '@/lib/image-processor';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  productDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ImageEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();
  const [results, setResults] = useState<{
    processedImages: ProcessedImage[];
    aiContent: GenerateProductDetailsOutput;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: 'Por favor, envie uma imagem menor que 10MB.',
        });
        return;
      }
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setResults(null);
    }
  };

  const onSubmit = (values: FormValues) => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma imagem selecionada',
        description: 'Por favor, envie uma imagem para processar.',
      });
      return;
    }

    startTransition(async () => {
      setResults(null);
      try {
        const dimensions: Dimension[] = [
          {
            name: 'site',
            width: 1300,
            height: 2000,
          },
          { name: 'erp', width: 500, height: 500 },
        ];

        const [processedImages, aiResult] = await Promise.all([
          processImage(file, dimensions),
          getAiGeneratedContent(
            await fileToDataURI(file),
            values.productDescription
          ),
        ]);

        if (!aiResult.success) {
          throw new Error(aiResult.error);
        }

        setResults({ processedImages, aiContent: aiResult.data });
        toast({
          title: 'Sucesso!',
          description: 'Suas imagens e conteúdo de IA estão prontos.',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
          variant: 'destructive',
          title: 'Falha no processamento',
          description: errorMessage,
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-headline text-4xl md:text-5xl font-bold">
            Kit de Ferramentas de Imagem e Conteúdo
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Envie a imagem do seu produto e deixe nossa IA cuidar do resto.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
              >
                <div className="space-y-4">
                  <Label htmlFor="file-upload" className="font-medium">Imagem do Produto</Label>
                  <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessing}
                    />
                    {filePreview ? (
                      <div className="relative aspect-square max-h-[300px] mx-auto">
                        <Image
                          src={filePreview}
                          alt="Pré-visualização"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <UploadCloud className="w-12 h-12" />
                        <p className="font-medium">
                          Clique ou arraste o arquivo para esta área para enviar
                        </p>
                        <p className="text-sm">PNG, JPG, GIF até 10MB</p>
                      </div>
                    )}
                  </div>
                   <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição da Peça (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Camiseta de algodão com estampa de folhagem, modelagem reta..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6 flex flex-col justify-between h-full">
                  <div>
                    <Label className="font-medium">Dimensões de Saída</Label>
                    <div className="space-y-2 mt-2">
                       <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <span className="font-medium text-sm">Imagem para o Site</span>
                        <span className="text-sm text-muted-foreground">1300 x 2000 px</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                         <span className="font-medium text-sm">Imagem para o ERP</span>
                         <span className="text-sm text-muted-foreground">500 x 500 px</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing || !file}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-5 w-5" />
                    )}
                    {isProcessing ? 'Processando...' : 'Gerar com IA'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isProcessing && (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">
              A IA está fazendo sua mágica... por favor, aguarde.
            </p>
          </div>
        )}

        {results && <ProcessedImagesDisplay {...results} />}
      </div>
    </div>
  );
}
