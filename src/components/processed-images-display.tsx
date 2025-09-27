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
import {
  Check,
  Clipboard,
  Sparkles,
  Tags,
} from 'lucide-react';
import { useState } from 'react';

// O componente principal agora é renderizado diretamente na page.tsx,
// então esta exportação pode ser removida se não for mais usada em outro lugar.
export function ProcessedImagesDisplay({
  processedImages
}: {
  processedImages: ProcessedImage[];
}) {
  // A lógica de exibição de imagens foi movida para page.tsx para maior controle
  return null;
}

function AiContentSection({
  content,
}: {
  content: GenerateProductDetailsOutput;
}) {
  return (
    <Card className='bg-card/50 backdrop-blur-sm'>
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

ProcessedImagesDisplay.AiContentSection = AiContentSection;


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
