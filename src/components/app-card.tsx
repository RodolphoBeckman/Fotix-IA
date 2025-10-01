import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type AppCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function AppCard({ href, icon, title, description }: AppCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full bg-card/50 backdrop-blur-sm transition-all group-hover:border-primary group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-3 rounded-md bg-primary/10 text-primary border border-primary/20">
            {icon}
          </div>
          <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
