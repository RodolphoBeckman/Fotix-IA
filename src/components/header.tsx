'use client';

import { Image, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { FotixLogo } from './fotix-logo';
import { useTheme } from 'next-themes';

export function Header() {
  const { setTheme, theme } = useTheme();

  return (
    <header className="border-b border-border/50 bg-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/image-editor" className="flex items-center gap-2">
            <FotixLogo className='h-7 w-7' />
            <h1 className="font-headline text-2xl font-semibold text-foreground">
              Fotix
            </h1>
          </Link>
          <div className='flex items-center gap-2'>
            <Button variant="outline" className='bg-card/50 backdrop-blur-sm'>
              <Image className="mr-2 h-4 w-4" />
              Editor de Imagem
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className='bg-card/50 backdrop-blur-sm'
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
