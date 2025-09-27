'use client';

import type { GenerateProductDetailsOutput } from '@/ai/flows/generate-product-details';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import {
  ArrowLeft,
  Download,
  ImageIcon,
  Loader2,
  Scan,
  Sparkles,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { FotixLogo } from '@/components/fotix-logo';

const formSchema = z.object({
  productDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  originalFileName: string;
  originalFileUrl: string;
  processedImages: ProcessedImage[];
  aiContent: GenerateProductDetailsOutput | null;
};


export default function ImageEditorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();
  const [results, setResults] = useState<Result[] | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiContent, setAiContent] = useState<GenerateProductDetailsOutput | null>(null);

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
          description: 'Agora você pode gerar o conteúdo de IA e baixar suas imagens.',
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

  const onAiGenerate = async (values: FormValues) => {
    if (!results || results.length === 0) return;
    
    setIsGeneratingAi(true);

    try {
        // Por simplicidade, usamos a primeira imagem para o contexto da IA
        const representativeImageUri = results[0].originalFileUrl;

        const aiResult = await getAiGeneratedContent(
            representativeImageUri,
            values.productDescription
        );

        if (!aiResult.success) {
            throw new Error(aiResult.error);
        }

        setAiContent(aiResult.data);

        toast({
            title: 'Conteúdo Gerado!',
            description: `IA concluiu a geração para o lote de imagens.`,
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
        setIsGeneratingAi(false);
    }
  };

  const handleDownloadImage = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleDownloadAll = () => {
    if (!results) return;

    results.forEach(result => {
        result.processedImages.forEach(image => {
            handleDownloadImage(image.url, image.name);
        });
    });

    toast({
        title: 'Download Iniciado',
        description: 'Todas as imagens processadas estão sendo baixadas.',
    });
  };


  const handleReset = () => {
    setFiles([]);
    setFilePreviews([]);
    setResults(null);
    setAiContent(null);
    form.reset();
  };

  if (results) {
    return (
       <div className="container mx-auto px-4 py-8">
         <div className='flex items-center justify-between mb-6'>
            <Button variant="outline" onClick={handleReset}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Gerar Novas Imagens
            </Button>
            <Button onClick={handleDownloadAll}>
                <Download className="mr-2 h-4 w-4" />
                Baixar Todas
            </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Coluna da Esquerda - Galeria de Imagens */}
           <div className="space-y-4">
              <h2 className="text-2xl font-headline flex items-center gap-2">
                <ImageIcon className="text-primary" />
                Galeria de Imagens
              </h2>
              <div className="space-y-6">
                {results.map((result, index) => {
                    const siteImage = result.processedImages.find(img => img.name.includes('1300x2000'));
                    const erpImage = result.processedImages.find(img => img.name.includes('500x500'));

                    if (!siteImage || !erpImage) return null;
                    
                    return (
                        <Card key={index} className="overflow-hidden bg-card/50 backdrop-blur-sm">
                           <CardContent className="p-4">
                                <p className='text-sm font-medium text-muted-foreground mb-4'>{result.originalFileName}</p>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    {/* Imagem do Site */}
                                    <div className="relative group aspect-[13/20]">
                                        <Image
                                            src={siteImage.url}
                                            alt={siteImage.name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="bg-background/80 hover:bg-background"
                                                onClick={() => handleDownloadImage(siteImage.url, siteImage.name)}
                                                aria-label="Download Imagem do Site"
                                            >
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </div>
                                         <div className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-full">
                                            {siteImage.width}x{siteImage.height} (Site)
                                        </div>
                                    </div>
                                     {/* Imagem ERP */}
                                     <div className="relative group aspect-square">
                                        <Image
                                            src={erpImage.url}
                                            alt={erpImage.name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="bg-background/80 hover:bg-background"
                                                onClick={() => handleDownloadImage(erpImage.url, erpImage.name)}
                                                aria-label="Download Imagem ERP"
                                            >
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </div>
                                         <div className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-full">
                                            {erpImage.width}x{erpImage.height} (ERP)
                                        </div>
                                    </div>
                                </div>
                           </CardContent>
                        </Card>
                    );
                })}
              </div>
           </div>

           {/* Coluna da Direita - IA e Favoritos */}
           <div className="space-y-8">
                {/* Seção de IA */}
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 font-headline">
                            <Sparkles className="text-primary" />
                            Gerar Conteúdo com IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onAiGenerate)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="productDescription"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                        <Textarea
                                            placeholder="Descreva a peça para refinar os resultados da IA (Ex: Camiseta de algodão com estampa de folhagem...)"
                                            className="resize-none min-h-[120px] bg-input/80"
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
                                    disabled={isGeneratingAi}
                                >
                                    {isGeneratingAi ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    )}
                                    {isGeneratingAi ? 'Gerando...' : 'Gerar com IA'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Seção de Conteúdo Gerado */}
                {aiContent && (
                    <ProcessedImagesDisplay.AiContentSection content={aiContent} />
                )}
           </div>
        </div>
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4" onPaste={handlePaste}>
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FotixLogo className="h-12 w-12" />
          <h1 className="font-headline text-5xl font-semibold text-foreground">
            Fotix
          </h1>
        </div>
        <p className="text-muted-foreground text-lg mb-8">
            Crie conteúdo de alta qualidade para o seu e-commerce com o poder da IA.
        </p>

        <div className="space-y-8">
            <div className="space-y-4">
            <div 
              style={{
                  background: 'linear-gradient(145deg, rgba(160, 120, 240, 0.1), rgba(120, 180, 250, 0.1))',
                  boxShadow: '0 0 0 1px rgba(160, 120, 240, 0.3), 0 0 20px -5px rgba(160, 120, 240, 0.3)'
              }}
              className="relative border-2 border-dashed border-primary/30 rounded-lg p-10 text-center cursor-pointer hover:border-primary transition-colors bg-accent/20 backdrop-blur-sm"
            >
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
                    <div className="p-3 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Scan className="w-10 h-10" />
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
