
import { Button } from '@/components/ui/button';
import { Briefcase, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center gap-4 text-primary">
            <Briefcase className="h-16 w-16" />
            <h1 className="text-6xl font-bold font-headline">
                ObraLink
            </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
            La solución digital para la gestión de tus obras. Elige cómo quieres empezar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/auth/register/empresa" passHref>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-8 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
              >
                <Zap className="mr-3 h-6 w-6" /> Registrar Empresa
              </Button>
            </Link>
            <Link href="/dashboard" passHref>
                <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 py-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
                >
                     Ver Demo
                </Button>
            </Link>
        </div>
      </div>
       <footer className="absolute bottom-0 py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} ObraLink. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
