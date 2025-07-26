
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Construction, FileText, Cpu, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Construction className="h-10 w-10 text-accent" />,
      title: "Centralized Management",
      description: "Manage company profiles, projects, and users all in one place.",
      delay: "animate-fade-in-up animation-delay-200"
    },
    {
      icon: <FileText className="h-10 w-10 text-accent" />,
      title: "Smart Digital Reports",
      description: "Create and validate digital work reports with photos and signatures.",
      delay: "animate-fade-in-up animation-delay-400"
    },
    {
      icon: <Cpu className="h-10 w-10 text-accent" />,
      title: "AI Optimization",
      description: "Generate reports and receive resource allocation suggestions with AI.",
      delay: "animate-fade-in-up animation-delay-600"
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-accent" />,
      title: "Proven Efficiency",
      description: "Reduce paperwork, minimize errors, and streamline your daily processes.",
      delay: "animate-fade-in-up animation-delay-800"
    },
  ];

  const testimonials = [
    {
      quote: "ObraLink has transformed our project management. The AI resource allocation is a game-changer, saving us countless hours and preventing bottlenecks before they even start.",
      name: "Javier Gómez",
      role: "CEO, Constructora Innova",
      avatar: "https://placehold.co/100x100.png",
      dataAiHint: "man portrait"
    },
    {
      quote: "Finally, a tool that understands the construction industry. Moving from paper to digital reports with photo evidence has improved our communication and accountability tenfold.",
      name: "María Fernández",
      role: "Project Manager",
      avatar: "https://placehold.co/101x101.png",
      dataAiHint: "woman portrait"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary/95 text-primary-foreground py-3 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/landingdemo" className="hover:opacity-90 transition-opacity flex items-center gap-2">
            <Construction className="h-8 w-8 text-accent"/>
            <span className="text-2xl font-bold font-headline">ObraLink</span>
          </Link>
          <nav className="flex items-center gap-2">
             <Link href="/auth/register/empresa" passHref>
              <Button variant="ghost" className="hidden sm:inline-flex text-primary-foreground hover:bg-primary/80">Register Company</Button>
            </Link>
            <Link href="/dashboard" passHref>
              <Button variant="secondary" className="text-primary hover:bg-secondary/80">Access</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center text-white overflow-hidden">
           <div className="absolute inset-0">
            <Image
              src="https://placehold.co/1920x1080.png"
              alt="A modern construction site at sunset, showcasing efficiency and progress."
              fill
              style={{objectFit: 'cover'}}
              quality={80}
              className="opacity-30"
              data-ai-hint="construction sunset"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary to-primary"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 leading-tight animate-fade-in-down">
              Build Faster, Manage Smarter
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              ObraLink is the all-in-one platform to digitize your construction management. From AI-powered insights to digital work orders, take full control of your operation.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up animation-delay-400">
                <Link href="/auth/register/empresa" passHref>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/dashboard" passHref>
                   <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                    Access Demo
                  </Button>
                </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Your Complete Toolkit for Success</h2>
              <p className="text-lg text-foreground/70 mt-2 max-w-2xl mx-auto">
                Discover the tools designed to empower your construction company, enhancing both efficiency and control.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`text-center bg-card p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-xl border-t-4 border-accent ${feature.delay} will-animate-fade-in-up`}
                >
                  <div className="mx-auto bg-accent/10 rounded-full p-4 w-fit mb-5">
                      {feature.icon}
                  </div>
                  <h3 className="font-headline text-xl font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-foreground/70 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
         {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Trusted by Industry Leaders</h2>
               <p className="text-lg text-foreground/70 mt-2 max-w-2xl mx-auto">
                See how construction companies are revolutionizing their workflow with ObraLink.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {testimonials.map((testimonial, index) => (
                     <Card key={index} className="shadow-lg animate-fade-in-up will-animate-fade-in-up" style={{animationDelay: `${index * 200}ms`}}>
                        <CardContent className="p-8">
                           <p className="text-lg text-foreground/80 italic mb-6">"{testimonial.quote}"</p>
                           <div className="flex items-center">
                             <Image src={testimonial.avatar} alt={`Avatar of ${testimonial.name}`} width={48} height={48} className="rounded-full mr-4 border-2 border-accent" data-ai-hint={testimonial.dataAiHint} />
                             <div>
                               <p className="font-semibold text-primary">{testimonial.name}</p>
                               <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                             </div>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <ShieldCheck className="h-16 w-16 text-accent mx-auto mb-6 animate-bounce-subtle" />
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Ready to Take the Digital Leap?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join the companies already building the future with ObraLink. Optimize, manage, and grow with the industry's leading platform.
            </p>
            <Link href="/auth/register/empresa" passHref>
              <Button size="lg" variant="secondary" className="text-primary hover:bg-background/90 text-lg px-10 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300">
                Register Your Company
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-primary/95 text-primary-foreground py-8 text-center border-t border-primary/20">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} ObraLink. All rights reserved.</p>
          <p className="text-sm opacity-80 mt-1">Digital Innovation for Modern Construction</p>
        </div>
      </footer>
    </div>
  );
}
