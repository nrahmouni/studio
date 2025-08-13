
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, HardHat, Building, Briefcase, ArrowRight, Wrench } from "lucide-react";
import Link from 'next/link';

interface SetupStep {
    step: number;
    title: string;
    description: string;
    link: string;
    linkText: string;
    icon: React.ElementType;
}

const setupSteps: SetupStep[] = [
    {
        step: 1,
        title: "Completa el Perfil de la Empresa",
        description: "Añade los detalles de tu empresa como el CIF, email de contacto y logo. Esto es importante para la documentación.",
        link: "/settings", // Settings page has company profile editing now
        linkText: "Ir al Perfil",
        icon: Building,
    },
    {
        step: 2,
        title: "Registra tus Subcontratas",
        description: "Da de alta a las empresas subcontratadas con las que trabajas desde la gestión de proyectos.",
        link: "/constructora/proyectos", // Changed to projects page
        linkText: "Gestionar Proyectos",
        icon: HardHat,
    },
    {
        step: 3,
        title: "Crea tu Primer Proyecto",
        description: "Define una obra, asigna una subcontrata y establece las fechas de inicio y fin.",
        link: "/constructora/proyectos",
        linkText: "Añadir Proyecto",
        icon: Briefcase,
    },
    {
        step: 4,
        title: "Gestiona Personal y Maquinaria",
        description: "El personal y la maquinaria son gestionados por cada subcontrata. Puedes ver los recursos asignados en cada proyecto.",
        link: "/constructora/proyectos", // Changed to projects page
        linkText: "Ver Proyectos",
        icon: Wrench,
    }
];

export default function CompanySetupPage() {
    return (
        <div className="container mx-auto py-8 px-4">
             <div className="animate-fade-in-down mb-8">
                <h1 className="text-3xl font-bold font-headline text-primary">¡Bienvenido a ObraLink!</h1>
                <p className="text-muted-foreground mt-1 text-lg">Sigue estos pasos para configurar tu empresa y empezar a gestionar tus obras.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {setupSteps.map((item, index) => (
                    <Card key={item.step} className={`animate-fade-in-up animation-delay-${(index + 1) * 150} flex flex-col`}>
                        <CardHeader className="flex flex-row items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-2xl shrink-0">{item.step}</div>
                            <div>
                                <CardTitle className="flex items-center gap-2"><item.icon className="h-6 w-6 text-primary"/>{item.title}</CardTitle>
                                <CardDescription className="mt-1">{item.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                            <Link href={item.link} className="w-full">
                                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    {item.linkText} <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mt-8 animate-fade-in-up animation-delay-700 bg-green-500/10 border-green-500/30">
                <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-3"><Check/> ¡Todo listo!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-green-600">Una vez completados los pasos, puedes ir a tu panel principal para ver el resumen de toda tu actividad.</p>
                    <Link href="/constructora/dashboard">
                        <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-500/20">
                            Ir al Panel Principal <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </CardContent>
            </Card>

        </div>
    )
}
