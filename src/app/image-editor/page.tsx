'use client';

import type { GenerateProductDetailsOutput } from '@/ai/flows/generate-product-details';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fileToDataURI, getAiGeneratedContent } from '@/lib/actions';
import {
  processImage,
  type Dimension,
  type ProcessedImage,
} from '@/lib/image-processor';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Camera, Loader2, Sparkles, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';


const formSchema = z.object({
  productDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  originalFileName: string;
  originalFileUrl: string; // To be used by AI
  processedImages: ProcessedImage[];
  aiContent: GenerateProductDetailsOutput | null;
};


export default function ImageEditorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();
  const [results, setResults] = useState<Result[] | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productDescription: '',
    },
  });

  const updateFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: `O arquivo ${file.name} excede o limite de 10MB.`,
        });
        return false;
      }
      return true;
    });

    setFiles(prevFiles => {
      // Evitar duplicatas
      const existingNames = new Set(prevFiles.map(f => f.name));
      const filteredNewFiles = validFiles.filter(f => !existingNames.has(f.name));
      return [...prevFiles, ...filteredNewFiles];
    });

    setResults(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      updateFiles(Array.from(selectedFiles));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      updateFiles(pastedFiles);
    }
  };

  useEffect(() => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(newPreviews);
    
    // Cleanup
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);


  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };


  const onImageProcess = () => {
    if (files.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhuma imagem selecionada',
        description: 'Por favor, envie pelo menos uma imagem para processar.',
      });
      return;
    }

    startTransition(async () => {
      try {
        const dimensions: Dimension[] = [
          { name: 'site', width: 1300, height: 2000 },
          { name: 'erp', width: 500, height: 500 },
        ];

        const resultsArray = await Promise.all(
          files.map(async file => {
            const processedImages = await processImage(file, dimensions);
            const originalFileUrl = await fileToDataURI(file);

            return {
              originalFileName: file.name,
              originalFileUrl,
              processedImages,
              aiContent: null,
            };
          })
        );
        
        setResults(resultsArray);
        toast({
          title: 'Imagens Processadas!',
          description: 'Agora você pode gerar o conteúdo de IA para cada imagem.',
        });

      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
          variant: 'destructive',
          title: 'Falha no processamento de imagem',
          description: errorMessage,
        });
      }
    });
  };

  const onAiGenerate = async (fileName: string, values: FormValues) => {
    const resultToUpdate = results?.find(r => r.originalFileName === fileName);
    if (!resultToUpdate) return;
    
    setIsGeneratingAi(fileName);

    try {
        const aiResult = await getAiGeneratedContent(
            resultToUpdate.originalFileUrl,
            values.productDescription
        );

        if (!aiResult.success) {
            throw new Error(aiResult.error);
        }

        setResults(prevResults => 
            prevResults!.map(r => 
                r.originalFileName === fileName ? { ...r, aiContent: aiResult.data } : r
            )
        );

        toast({
            title: 'Conteúdo Gerado!',
            description: `IA concluiu a geração para ${fileName}.`,
        });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        toast({
            variant: 'destructive',
            title: 'Falha na Geração de IA',
            description: errorMessage,
        });
    } finally {
        setIsGeneratingAi(null);
    }
};

  const handleReset = () => {
    setFiles([]);
    setFilePreviews([]);
    setResults(null);
    form.reset();
  };

  if (results) {
    return (
       <div className="container mx-auto px-4 py-8">
         <div className='flex items-center mb-4'>
            <Button variant="outline" onClick={handleReset}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Gerar Novas Imagens
            </Button>
        </div>
        <Tabs defaultValue={results[0].originalFileName} className="w-full">
            <TabsList>
                {results.map(result => (
                    <TabsTrigger key={result.originalFileName} value={result.originalFileName}>
                        {result.originalFileName}
                    </TabsTrigger>
                ))}
            </TabsList>
            {results.map(result => (
                <TabsContent key={result.originalFileName} value={result.originalFileName}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                        <ProcessedImagesDisplay processedImages={result.processedImages} />
                        <div className="space-y-4">
                             <Form {...form}>
                                <form onSubmit={form.handleSubmit((values) => onAiGenerate(result.originalFileName, values))} className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="productDescription"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                            <Textarea
                                                placeholder="Descreva a peça para refinar os resultados da IA (Ex: Camiseta de algodão com estampa de folhagem...)"
                                                className="resize-none min-h-[120px]"
                                                {...field}
                                            />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isGeneratingAi === result.originalFileName}
                                    >
                                        {isGeneratingAi === result.originalFileName ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        )}
                                        {isGeneratingAi === result.originalFileName ? 'Gerando...' : 'Gerar com IA'}
                                    </Button>
                                </form>
                            </Form>
                            {result.aiContent && (
                               <ProcessedImagesDisplay.AiContentSection content={result.aiContent} />
                            )}
                        </div>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4" onPaste={handlePaste}>
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

        <div className="space-y-8">
            <div className="space-y-4">
            <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 text-center cursor-pointer hover:border-primary transition-colors bg-input/20">
                <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
                multiple
                />
                {files.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {filePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image
                            src={preview}
                            alt={`Pré-visualização ${index + 1}`}
                            fill
                            className="object-contain rounded-md"
                            />
                            <button 
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 z-10"
                                aria-label="Remover imagem"
                            >
                                <X className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
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
            </div>
                <Button
                type="button"
                onClick={onImageProcess}
                className="w-full max-w-sm mx-auto"
                size="lg"
                disabled={isProcessing || files.length === 0}
                >
                {isProcessing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                )}
                {isProcessing ? 'Processando...' : 'Processar Imagens'}
                </Button>
        </div>
      </div>
    </div>
  );
}
