'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {CheckCircle, Construction, Cpu, FileText, ShieldCheck, TrendingUp, Zap} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: <Construction className="h-10 w-10 text-accent" />,
      title: "Centralized Management",
      description: "Manage company profiles, projects, and users in one place.",
      delay: 'animate-fade-in-up animation-delay-200',
    },
    {
      icon: <FileText className="h-10 w-10 text-accent" />,
      title: "Intelligent Digital Reports",
      description: "Create and validate digital work reports with photos and signatures.",
      delay: 'animate-fade-in-up animation-delay-400',
    },
    {
      icon: <Cpu className="h-10 w-10 text-accent" />,
      title: "AI Optimization",
      description: "Generate reports and receive resource allocation suggestions with AI.",
      delay: 'animate-fade-in-up animation-delay-600',
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-accent" />,
      title: "Proven Efficiency",
      description: "Reduce paperwork, minimize errors, and streamline your daily processes.",
      delay: 'animate-fade-in-up animation-delay-800',
    },
  ];

  const benefits = [
    {
      title: "Digitize and Simplify Your Reports",
      description: "Transform your paper work reports into a digital, accessible, and easy-to-manage format. Attach photos, record incidents, and get digital signatures instantly.",
      imageSrc: 'https://placehold.co/600x450.png',
      imageAlt: "Worker using a tablet on a construction site to manage digital reports.",
      dataAiHint: 'worker tablet construction',
      align: 'left',
    },
    {
      title: "Total Control of Your Projects",
      description: "From your company profile to the details of each project and user. Assign project managers, manage access, and keep all information organized and secure.",
      imageSrc: 'https://placehold.co/600x450.png',
      imageAlt: "Dashboard showing charts and data for construction project management.",
      dataAiHint: 'dashboard project management',
      align: 'right',
    },
    {
      title: "Smart Decisions with AI",
      description: "Our AI analyzes data from your reports to offer resource allocation suggestions, helping you prevent bottlenecks and optimize your team's productivity.",
      imageSrc: 'https://placehold.co/600x450.png',
      imageAlt: "Chart illustrating resource optimization through artificial intelligence.",
      dataAiHint: 'ai resource optimization chart',
      align: 'left',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary/95 text-primary-foreground py-3 shadow-lg backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Image
              src="https://placehold.co/160x36.png"
              alt="ObraLink Logo"
              width={160}
              height={36}
              priority
              data-ai-hint="logo"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" passHref>
              <Button variant="secondary" size="lg" className="text-primary hover:bg-secondary/80">
                Go to App
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
              alt="Team of construction professionals collaborating and planning a project on a site with blueprints and digital tablets."
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
              The <span className="text-accent">Digital Revolution</span> for your Projects
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              ObraLink optimizes the management of your construction and renovation projects. Digitize work reports, leverage AI for resource allocation, and take full control of your operation.
            </p>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-400"
              >
                <Zap className="mr-3 h-6 w-6" /> Start Optimizing Now!
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Everything You Need to Succeed</h2>
              <p className="text-lg text-foreground/70 mt-2 max-w-2xl mx-auto">Discover the tools designed to empower your construction and renovation company, improving efficiency and control.</p>
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
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Transform Your Way of Working</h2>
              <p className="text-lg text-foreground/70 mt-2 max-w-2xl mx-auto">ObraLink is not just an app; it's your strategic partner for efficiency, control, and modernization of your projects.</p>
            </div>
            <div className="space-y-16 md:space-y-24">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                    benefit.align === 'right' ? 'md:flex-row-reverse' : ''
                  }`}
                >
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
                  <div
                    className={`md:w-1/2 text-center md:text-left ${
                      benefit.align === 'right' ? 'md:text-right' : ''
                    } animate-fade-in-up animation-delay-${(index + 1) * 200} will-animate-fade-in-up`}
                  >
                    <h3 className="text-2xl md:text-3xl font-bold font-headline mb-4 text-primary">{benefit.title}</h3>
                    <p className="text-md md:text-lg text-foreground/80 mb-6">{benefit.description}</p>
                    <ul
                      className={`space-y-2 mb-6 text-left inline-block ${benefit.align === 'right' ? 'md:text-right' : ''}`}
                    >
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0" />
                        <span>Centralized and secure information</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0" />
                        <span>Improves team communication</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-accent mr-2 shrink-0" />
                        <span>Mobile access for on-site management</span>
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
                src="https://placehold.co/500x350.png"
                alt="Smiling construction worker with helmet and tools, indicating success and satisfaction with achieved efficiency."
                width={500}
                height={350}
                className="rounded-lg shadow-xl mx-auto object-cover"
                data-ai-hint="happy construction worker success"
              />
            </div>
            <ShieldCheck className="h-16 w-16 text-accent mx-auto mb-6 animate-bounce-subtle" />
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Ready to Take the Digital Leap?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join the companies that are already building the future with ObraLink. Optimize, manage, and grow with the leading platform in the sector.
            </p>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                variant="secondary"
                className="text-primary hover:bg-background/90 text-lg px-10 py-6 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300"
              >
                Access or Register
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
