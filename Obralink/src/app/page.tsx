
'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {CheckCircle, Construction, Cpu, FileText, ArrowRight, Star, BarChart} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Digital Work Reports",
      description: "Generate, validate, and manage work reports instantly from any device. Attach photos and collect digital signatures.",
      delay: 'animate-fade-in-up animation-delay-200',
    },
    {
      icon: <Construction className="h-8 w-8 text-primary" />,
      title: "Total Project Control",
      description: "Oversee all your projects, assign teams, and track progress in real-time from a centralized dashboard.",
      delay: 'animate-fade-in-up animation-delay-400',
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "AI-Powered Optimization",
      description: "Leverage AI to analyze workloads, predict bottlenecks, and get smart resource allocation suggestions.",
      delay: 'animate-fade-in-up animation-delay-600',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 flex justify-between items-center h-20">
          <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-2">
            <Image
              src="https://placehold.co/40x40.png"
              alt="ObraLink Logo"
              width={40}
              height={40}
              priority
              data-ai-hint="logo"
              className="rounded-lg"
            />
            <span className="text-2xl font-bold font-headline text-primary">ObraLink</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/dashboard" passHref>
              <Button variant="ghost">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register/empresa" passHref>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                Register Company
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center bg-grid-pattern">
          <div className="container mx-auto px-4">
            <div className="bg-accent text-accent-foreground font-semibold inline-block px-4 py-1 rounded-full text-sm animate-fade-in-down mb-4">
              Now with AI-Powered Resource Planning!
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 leading-tight text-primary animate-fade-in-down">
              Build Smarter, Not Harder.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              The all-in-one platform for construction companies. Digitize reports, manage projects, and optimize your resources with the power of AI.
            </p>
            <div className="flex justify-center items-center gap-4 animate-fade-in-up animation-delay-400">
                <Link href="/dashboard" passHref>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
                  >
                    View Demo
                  </Button>
                </Link>
            </div>
          </div>
        </section>
        
        {/* Visual Section */}
        <section className="container mx-auto px-4 -mt-16 relative z-10 animate-fade-in-up animation-delay-500">
             <Image
              src="https://placehold.co/1200x600.png"
              alt="ObraLink application dashboard showing project overview on a laptop screen."
              width={1200}
              height={600}
              className="rounded-2xl shadow-2xl border-4 border-background object-cover"
              data-ai-hint="app dashboard screen"
            />
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Your Complete Toolkit for Construction Management</h2>
              <p className="text-lg text-muted-foreground mt-2 max-w-3xl mx-auto">From the office to the field, ObraLink provides the tools you need to stay on time and on budget.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`bg-card p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow duration-300 ${feature.delay}`}
                >
                    <div className="mb-4 bg-primary/10 text-primary rounded-lg p-3 w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="font-headline text-xl text-primary mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-24 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
                 <div className="flex justify-center gap-1 mb-4 text-yellow-500">
                    <Star className="fill-current"/>
                    <Star className="fill-current"/>
                    <Star className="fill-current"/>
                    <Star className="fill-current"/>
                    <Star className="fill-current"/>
                </div>
                <blockquote className="max-w-3xl mx-auto">
                    <p className="text-2xl md:text-3xl font-medium text-primary leading-snug">
                        “ObraLink has revolutionized our daily reporting. What used to take hours of paperwork is now done in minutes from the site. Our project oversight has never been clearer.”
                    </p>
                </blockquote>
                <div className="mt-8 flex items-center justify-center gap-4">
                     <Image
                      src="https://placehold.co/48x48.png"
                      alt="Headshot of satisfied customer"
                      width={48}
                      height={48}
                      className="rounded-full"
                      data-ai-hint="man headshot"
                    />
                    <div>
                        <p className="font-semibold text-primary">Carlos Rodriguez</p>
                        <p className="text-muted-foreground">Site Manager, Constructora Innova</p>
                    </div>
                </div>
            </div>
        </section>


        {/* Final CTA Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container mx-auto px-4 text-center">
            <BarChart className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">Ready to Optimize Your Operations?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join dozens of construction companies building a more efficient future. Get started with ObraLink today. No credit card required.
            </p>
            <Link href="/dashboard" passHref>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} ObraLink. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary">Privacy Policy</Link>
                <Link href="#" className="hover:text-primary">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
