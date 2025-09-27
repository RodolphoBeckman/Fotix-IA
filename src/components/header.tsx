import { Camera } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Link href="/image-editor" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-2xl font-semibold text-foreground">
              Fotix AI
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
