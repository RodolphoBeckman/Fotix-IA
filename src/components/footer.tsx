import { Gem } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Gem className="w-4 h-4" />
            Construído com Next.js, Genkit e ShadCN UI.
          </p>
        </div>
      </div>
    </footer>
  );
}
