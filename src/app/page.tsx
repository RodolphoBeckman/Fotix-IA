
import { AppCard } from '@/components/app-card';
import { FotixLogo } from '@/components/fotix-logo';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-8">
        <div className="container mx-auto px-4 flex items-center justify-center gap-3">
          <FotixLogo className="h-12 w-12" />
          <h1 className="font-headline text-5xl font-semibold text-foreground">
            Fotix
          </h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-center text-lg text-muted-foreground mb-12">
          Seu kit de ferramentas de IA para E-commerce
        </h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
            <AppCard
              href="/image-editor"
              title="Editor de Imagens"
              description="Redimensione, edite e gere conteúdo de marketing para suas fotos de produto."
              icon={<FotixLogo className="w-8 h-8" />}
            />
          </div>
        </div>
      </main>
      <footer className="py-4">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Fotix. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
