'use client';

import type { GenerateProductDetailsOutput } from '@/ai/flows/generate-product-details';
import type { ProcessedImage } from '@/lib/image-processor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatBytes } from '@/lib/utils';
import {
  ArrowLeft,
  Check,
  Clipboard,
  Download,
  Image as ImageIcon,
  Sparkles,
  Tags,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ProcessedImagesDisplayProps {
  processedImages: ProcessedImage[];
  aiContent: GenerateProductDetailsOutput;
  onReset: () => void;
}

export function ProcessedImagesDisplay({
  processedImages,
  aiContent,
  onReset,
}: ProcessedImagesDisplayProps) {
  return (
    <>
    <div className='flex items-center mb-4'>
        <Button variant="outline" onClick={onReset}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Gerar Novas Imagens
        </Button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ProcessedImagesSection images={processedImages} />
      <AiContentSection content={aiContent} />
    </div>
    </>
  );
}

function ProcessedImagesSection({ images }: { images: ProcessedImage[] }) {
  const handleDownload = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ImageIcon className="text-primary" />
          Imagens Processadas
        </CardTitle>
        <CardDescription>
          Suas imagens foram redimensionadas e estão prontas para download.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.map((image) => (
          <div
            key={image.name}
            className="flex items-center gap-4 p-2 rounded-lg border"
          >
            <Image
              src={image.url}
              alt={image.name}
              width={64}
              height={64}
              className="rounded-md object-cover aspect-square"
            />
            <div className="flex-1 text-sm">
              <p className="font-medium">{image.name}</p>
              <p className="text-muted-foreground">
                {image.width} x {image.height} px &bull; {formatBytes(image.size)}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDownload(image.url, image.name)}
              aria-label={`Baixar ${image.name}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AiContentSection({
  content,
}: {
  content: GenerateProductDetailsOutput;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="text-primary" />
          Conteúdo Gerado por IA
        </CardTitle>
        <CardDescription>
          Textos de marketing e tags de SEO gerados pela Fotix AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <CopyableContent title="Título do Produto" content={content.title} />
        </div>
        <Separator />
        <div>
          <CopyableContent
            title="Descrição do Produto"
            content={content.description}
            isTextArea={true}
          />
        </div>
        <Separator />
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Tags className="w-4 h-4 text-muted-foreground" />
            Tags de SEO
          </h3>
          <div className="flex flex-wrap gap-2">
            {content.seoTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CopyableContent({
  title,
  content,
  isTextArea = false,
}: {
  title: string;
  content: string;
  isTextArea?: boolean;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      description: `${title} copiado para a área de transferência.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Clipboard className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className={`text-sm text-muted-foreground bg-muted/50 p-3 rounded-md ${
          isTextArea ? 'whitespace-pre-wrap min-h-[100px]' : ''
        }`}
      >
        {content}
      </div>
    </div>
  );
}
