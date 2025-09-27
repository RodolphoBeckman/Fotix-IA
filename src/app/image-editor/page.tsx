'use client';

import type { GenerateProductDetailsOutput } from '@/ai/flows/generate-product-details';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fileToDataURI, getAiGeneratedContent } from '@/lib/actions';
import {
  processImage,
  type Dimension,
  type ProcessedImage,
} from '@/lib/image-processor';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2, Sparkles, UploadCloud } from 'lucide-react';
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

  const handleReset = () => {
    setFile(null);
    setFilePreview(null);
    setResults(null);
    form.reset();
  };

  if (results) {
    return (
       <div className="container mx-auto px-4 py-8">
        <ProcessedImagesDisplay {...results} onReset={handleReset} />
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="h-10 w-10 text-primary" />
             <h1 className="font-headline text-5xl font-semibold text-foreground">
              Fotix
            </h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8">
            Crie conteúdo de alta qualidade para o seu e-commerce com o poder da IA.
        </p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                 <div className="space-y-4">
                  <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 text-center cursor-pointer hover:border-primary transition-colors bg-input/20">
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessing}
                    />
                    {filePreview ? (
                      <div className="relative aspect-video max-h-[250px] mx-auto">
                        <Image
                          src={filePreview}
                          alt="Pré-visualização"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                          <UploadCloud className="w-10 h-10" />
                        </div>
                        <div>
                            <p className="font-medium">
                            Arraste, cole, ou <span className="text-primary">clique para escanear</span>
                            </p>
                            <p className="text-sm">
                            Suporta: JPG, PNG, WEBP até 10MB
                            </p>
                        </div>
                      </div>
                    )}
                  </div>
                   <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Opcional: Descreva a peça para refinar os resultados da IA (Ex: Camiseta de algodão com estampa de folhagem...)"
                            className="resize-none text-center bg-input/20"
                            {...field}
                             disabled={!file || isProcessing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <Button
                    type="submit"
                    className="w-full max-w-sm mx-auto"
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
            </form>
        </Form>
      </div>
    </div>
  );
}
