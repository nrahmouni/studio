
import {Button} from '@/components/ui/button';
import {Briefcase, Construction, Cpu, FileText, ShieldCheck, TrendingUp, Zap} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function HomePage() {
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary/95 text-primary-foreground py-3 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-2">
              <Briefcase className="h-7 w-7"/>
              <span className="font-headline text-2xl font-bold">ObraLink</span>
          </Link>
          <nav className="flex items-center gap-4">
             <Link href="/auth/login/empresa" passHref>
                <Button variant="ghost" size="lg">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register/empresa" passHref>
              <Button variant="secondary" size="lg" className="text-primary hover:bg-secondary/80">
                Registrar Empresa
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://placehold.co/1200x800.png"
              alt="Equipo de profesionales de la construcción colaborando y planificando un proyecto en una obra con planos y tabletas digitales."
              fill
              style={{objectFit: 'cover'}}
              quality={80}
              className="opacity-30"
              data-ai-hint="construction planning team"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/90 to-primary"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 leading-tight animate-fade-in-down">
              La <span className="text-accent">Revolución Digital</span> para tus Obras
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              ObraLink optimiza la gestión de tus proyectos de construcción y reformas. Digitaliza partes de trabajo, aprovecha la IA para la asignación de recursos y toma el control total de tu operación.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register/empresa" passHref>
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-400"
                  >
                    <Zap className="mr-3 h-6 w-6" /> Registrar Empresa
                  </Button>
                </Link>
                 <Link href="/dashboard" passHref>
                    <Button
                        size="lg"
                        variant="outline"
                        className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/50 text-lg px-10 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-600"
                    >
                         Ver Demo
                    </Button>
                 </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary/95 text-primary-foreground py-8 text-center border-t border-primary/20">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ObraLink. Todos los derechos reservados.</p>
          <p className="text-sm opacity-80 mt-1">Innovación Digital para la Construcción Moderna</p>
        </div>
      </footer>
    </div>
  );
}
