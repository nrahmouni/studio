
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Construction, FileText, Cpu, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import obraLinkLogo from "@/assets/logo.png"; 
import benefitImg1 from "@/assets/img1.jpg";
import benefitImg2 from "@/assets/img2.jpg";
import benefitImg3 from "@/assets/img3.jpg";

export default function HomePage() {
  const features = [
    {
      icon: <Construction className="h-10 w-10 text-accent" />,
      title: "Gestión Centralizada",
      description: "Administra perfiles de empresa, obras y usuarios en un solo lugar.",
      delay: "animate-fade-in-up animation-delay-200"
    },
    {
      icon: <FileText className="h-10 w-10 text-accent" />,
      title: "Partes Digitales Inteligentes",
      description: "Crea y valida partes de trabajo digitales con fotos y firmas.",
      delay: "animate-fade-in-up animation-delay-400"
    },
    {
      icon: <Cpu className="h-10 w-10 text-accent" />,
      title: "Optimización con IA",
      description: "Genera informes y recibe sugerencias de asignación de recursos con IA.",
      delay: "animate-fade-in-up animation-delay-600"
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-accent" />,
      title: "Eficiencia Comprobada",
      description: "Reduce el papeleo, minimiza errores y agiliza tus procesos diarios.",
      delay: "animate-fade-in-up animation-delay-800"
    },
  ];

  const benefits = [
    {
      title: "Digitaliza y Simplifica tus Partes",
      description: "Transforma tus partes de trabajo en papel a un formato digital, accesible y fácil de gestionar. Adjunta fotos, registra incidencias y obtén firmas digitales al instante.",
      imageSrc: benefitImg1,
      imageAlt: "Trabajador utilizando una tablet en una obra para gestionar partes digitales.",
      dataAiHint: "worker tablet construction",
      align: "left"
    },
    {
      title: "Control Total de tus Proyectos",
      description: "Desde el perfil de tu empresa hasta el detalle de cada obra y usuario. Asigna jefes de obra, gestiona accesos y mantén toda la información organizada y segura.",
      imageSrc: benefitImg2,
      imageAlt: "Panel de control mostrando gráficos y datos de gestión de proyectos de construcción.",
      dataAiHint: "dashboard project management",
      align: "right"
    },
    {
      title: "Decisiones Inteligentes con IA",
      description: "Nuestra IA analiza los datos de tus partes para ofrecerte sugerencias de asignación de recursos, ayudándote a prevenir cuellos de botella y optimizar la productividad de tu equipo.",
      imageSrc: benefitImg3,
      imageAlt: "Gráfico ilustrando la optimización de recursos mediante inteligencia artificial.",
      dataAiHint: "ai resource optimization chart",
      align: "left"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary/95 text-primary-foreground py-3 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Image
              src={obraLinkLogo} 
              alt="Logo de ObraLink"
              width={160}
              height={36} 
              priority 
            />
          </Link>
          <nav>
            <Link href="/auth/select-role" passHref>
              <Button variant="secondary" size="lg" className="text-primary hover:bg-secondary/80">Acceder</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-white overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/hero-image.jpg" 
              alt="Equipo de profesionales de la construcción colaborando y planificando un proyecto en una obra con planos y tabletas digitales."
              fill
              objectFit="cover"
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
            <Link href="/auth/select-role" passHref>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-400">
                <Zap className="mr-3 h-6 w-6" /> ¡Empieza a Optimizar Ahora!
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Todo lo que Necesitas para Triunfar</h2>
              <p className="text-lg text-foreground/70 mt-2 max-w-2xl mx-auto">
                Descubre las herramientas diseñadas para potenciar tu empresa de construcción y reformas, mejorando la eficiencia y el control.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className={`text-center bg-card shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-xl overflow-hidden ${feature.delay} will-animate-fade-in-up`}
                >
                  <CardHeader className="p-6">
                    <div className="mx-auto bg-accent/10 rounded-full p-4 w-fit mb-5 border-2 border-accent/30">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline text-xl text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-foreground/70 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Benefits / How It Works Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Transforma tu Manera de Trabajar</h2>
              <p className="text-lg text-foreground/70 mt-2 max-w-2xl mx-auto">
                ObraLink no es solo una app, es tu socio estratégico para la eficiencia, el control y la modernización de tus proyectos.
              </p>
            </div>
            <div className="space-y-16 md:space-y-24">
              {benefits.map((benefit, index) => (
                <div key={benefit.title} className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${benefit.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 animate-fade-in-up will-animate-fade-in-up">
                    <Image
                      src={benefit.imageSrc}
                      alt={benefit.imageAlt}
                      width={600}
                      height={450}
                      className="rounded-xl shadow-2xl object-cover aspect-[4/3]"
                      data-ai-hint={benefit.dataAiHint}
                    />
                  </div>
                  <div className={`md:w-1/2 text-center md:text-left ${benefit.align === 'right' ? 'md:text-right' : ''} animate-fade-in-up animation-delay-${(index+1)*200} will-animate-fade-in-up`}>
                    <h3 className="text-2xl md:text-3xl font-bold font-headline mb-4 text-primary">{benefit.title}</h3>
                    <p className="text-md md:text-lg text-foreground/80 mb-6">{benefit.description}</p>
                    <ul className={`space-y-2 mb-6 text-left inline-block ${benefit.align === 'right' ? 'md:text-right' : ''}`}>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0" />
                        <span>Información centralizada y segura</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0" />
                        <span>Mejora la comunicación del equipo</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0" />
                        <span>Acceso móvil para gestión en obra</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-8 animate-fade-in-up">
               <Image
                  src="/cta-image.jpg"
                  alt="Trabajador de construcción sonriente con casco y herramientas, indicando éxito y satisfacción con la eficiencia obtenida."
                  width={500} 
                  height={350} 
                  className="rounded-lg shadow-xl mx-auto object-cover"
                  data-ai-hint="happy construction worker success"
                />
            </div>
            <ShieldCheck className="h-16 w-16 text-accent mx-auto mb-6 animate-bounce-subtle" />
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">¿Listo para dar el Salto Digital?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Únete a las empresas que ya están construyendo el futuro con ObraLink. Optimiza, gestiona y crece con la plataforma líder del sector.
            </p>
            <Link href="/auth/select-role" passHref>
              <Button size="lg" variant="secondary" className="text-primary hover:bg-background/90 text-lg px-10 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300">
                Accede o Regístrate
              </Button>
            </Link>
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
