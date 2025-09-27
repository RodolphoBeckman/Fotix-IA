import { Image } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/image-editor" className="flex items-center gap-2">
            <h1 className="font-headline text-2xl font-semibold text-foreground">
              Fotix
            </h1>
          </Link>
          <Button variant="outline">
            <Image className="mr-2 h-4 w-4" />
            Editor de Imagem
          </Button>
          <div/>
        </div>
      </div>
    </header>
  );
}
