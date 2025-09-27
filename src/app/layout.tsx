'use client';

import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.body.style.setProperty('--x', `${e.clientX}px`);
      document.body.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Fotix AI</title>
        <meta name="description" content="Kit de ferramentas com IA para criação de conteúdo de e-commerce de moda." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya&family=Belleza&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background relative">
        <div 
          className="pointer-events-none fixed inset-0 z-0 transition-all duration-500" 
          style={{
            background: 'radial-gradient(600px at var(--x) var(--y), rgba(140, 100, 255, 0.15), transparent 80%)'
          }}
        />
        <div className="relative z-10">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
