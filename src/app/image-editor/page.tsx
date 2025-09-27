'use client';

import type { GenerateProductDetailsOutput } from '@/ai/flows/generate-product-details';
import { ProcessedImagesDisplay } from '@/components/processed-images-display';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  websiteWidth: z.coerce
    .number()
    .min(50, 'Min 50px')
    .max(4000, 'Max 4000px'),
  websiteHeight: z.coerce
    .number()
    .min(50, 'Min 50px')
    .max(4000, 'Max 4000px'),
  erpWidth: z.coerce.number().min(50, 'Min 50px').max(4000, 'Max 4000px'),
  erpHeight: z.coerce.number().min(50, 'Min 50px').max(4000, 'Max 4000px'),
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
      websiteWidth: 1080,
      websiteHeight: 1080,
      erpWidth: 400,
      erpHeight: 400,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 10MB.',
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
        title: 'No image selected',
        description: 'Please upload an image to process.',
      });
      return;
    }

    startTransition(async () => {
      setResults(null);
      try {
        const dimensions: Dimension[] = [
          {
            name: 'website',
            width: values.websiteWidth,
            height: values.websiteHeight,
          },
          { name: 'erp', width: values.erpWidth, height: values.erpHeight },
        ];

        const [processedImages, aiResult] = await Promise.all([
          processImage(file, dimensions),
          getAiGeneratedContent(await fileToDataURI(file)),
        ]);

        if (!aiResult.success) {
          throw new Error(aiResult.error);
        }

        setResults({ processedImages, aiContent: aiResult.data });
        toast({
          title: 'Success!',
          description: 'Your images and AI content are ready.',
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
          variant: 'destructive',
          title: 'Processing failed',
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
            Image & Content Toolkit
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Upload your product image, and let our AI handle the rest.
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
                  <Label htmlFor="file-upload" className="font-medium">Product Image</Label>
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
                          alt="Preview"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <UploadCloud className="w-12 h-12" />
                        <p className="font-medium">
                          Click or drag file to this area to upload
                        </p>
                        <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="font-medium">Output Dimensions</Label>
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="website"
                      className="w-full"
                    >
                      <AccordionItem value="website">
                        <AccordionTrigger>Website Image</AccordionTrigger>
                        <AccordionContent className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="websiteWidth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Width (px)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="websiteHeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height (px)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="erp">
                        <AccordionTrigger>ERP Image</AccordionTrigger>
                        <AccordionContent className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="erpWidth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Width (px)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="erpHeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height (px)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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
                    {isProcessing ? 'Processing...' : 'Generate with AI'}
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
              AI is working its magic... please wait.
            </p>
          </div>
        )}

        {results && <ProcessedImagesDisplay {...results} />}
      </div>
    </div>
  );
}
