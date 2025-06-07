import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Construction, FileText, Cpu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Construction className="h-8 w-8 text-primary" />,
      title: "Perfiles de Empresa",
      description: "Crea y gestiona el perfil de tu constructora.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Partes Digitales",
      description: "Registra órdenes de trabajo digitalmente.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Adjuntos Fotográficos",
      description: "Incluye fotos en tus partes para mayor claridad.",
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "Informes PDF e IA",
      description: "Genera PDFs y optimiza recursos con IA.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">ObraLink</h1>
          <nav>
            <Link href="/auth/select-role" passHref>
              <Button variant="secondary">Acceder</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-16 md:py-24 bg-background text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6 text-primary">
              Optimiza la Gestión de tus Obras y Reformas
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-3xl mx-auto">
              ObraLink te ofrece las herramientas para digitalizar tus partes de trabajo,
              gestionar tu equipo y tomar decisiones inteligentes para tus proyectos.
            </p>
            <Link href="/auth/select-role" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Comienza Ahora
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold font-headline text-center mb-12 text-primary">
              Funcionalidades Destacadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/600x400.png"
                alt="Equipo de construcción trabajando"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                data-ai-hint="construction team"
              />
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <h3 className="text-3xl font-bold font-headline mb-6 text-primary">
                Eficiencia y Control en la Palma de tu Mano
              </h3>
              <p className="text-lg text-foreground/80 mb-6">
                Nuestra plataforma está diseñada para ser intuitiva y accesible desde cualquier dispositivo,
                permitiendo a tus jefes de obra y trabajadores gestionar sus tareas eficientemente desde el terreno.
              </p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  Acceso móvil para gestión en obra.
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  Documentación centralizada y segura.
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-accent mr-2" />
                  Mejora la comunicación y colaboración.
                </li>
              </ul>
              <Link href="/auth/select-role" passHref>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Más Información
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-8 text-center">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ObraLink. Todos los derechos reservados.</p>
          <p className="text-sm opacity-80 mt-1">Innovación para la Construcción</p>
        </div>
      </footer>
    </div>
  );
}
