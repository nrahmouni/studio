// src/app/(app)/settings/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Palette, Bell, ShieldCheck, Info, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { seedDemoData } from "@/lib/actions/seed.actions";

export default function SettingsPage() {
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setSeeding(true);
    toast({ title: "Procesando...", description: "Creando datos de demostración en Firestore..." });
    try {
      const result = await seedDemoData();
      if (result.success) {
        toast({ title: "Éxito", description: result.message, duration: 7000 });
        console.log("Resumen del Seeding:", result.summary);
      } else {
        toast({ title: "Error en Seeding", description: result.message, variant: "destructive", duration: 10000 });
        console.error("Error en Seeding:", result.summary);
      }
    } catch (error: any) {
      toast({ title: "Error Crítico en Seeding", description: error.message || "Ocurrió un error inesperado.", variant: "destructive", duration: 10000 });
      console.error("Error Crítico en Seeding:", error);
    } finally {
      setSeeding(false);
    }
  };

  const settingsCards = [
    {
      icon: Database,
      title: "Gestión de Datos (Demo)",
      description: "Crea o reinicia los datos de demostración en Firestore.",
      content: (
        <>
          <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/30 text-sm text-blue-700 flex items-start">
            <Info className="mr-2 h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
            <span>Para que la aplicación funcione con datos persistentes, necesita acceso a Firestore. Este botón poblará tu base de datos con datos de ejemplo.</span>
          </div>
          <Button onClick={handleSeedData} disabled={seeding} className="w-full mt-4">
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Poblar Datos de Demostración
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Asegúrate de que tus reglas de seguridad de Firestore permiten la escritura (<code>allow read, write: if true;</code>) para el desarrollo.
          </p>
        </>
      )
    },
    {
      icon: Palette,
      title: "Apariencia y Tema",
      description: "Personaliza la visualización de la aplicación.",
      content: (
        <>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
            <Label htmlFor="dark-mode-switch" className="text-md">Modo Oscuro/Claro</Label>
            <Switch id="dark-mode-switch" checked disabled title="El tema se gestiona desde la cabecera" />
          </div>
          <p className="text-sm text-muted-foreground">
            Puedes cambiar entre el tema claro y oscuro usando el icono <Palette className="inline h-4 w-4 text-primary" /> / <Settings className="inline h-4 w-4 text-primary" />  en la esquina superior derecha de la cabecera.
          </p>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Más opciones de tema (Próximamente)">
            Personalización Avanzada (Próximamente)
          </Button>
        </>
      )
    },
    {
      icon: Bell,
      title: "Preferencias de Notificación",
      description: "Configura cómo y cuándo deseas recibir notificaciones. (Funcionalidad en desarrollo)",
      content: (
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-md">Notificaciones por Email</Label>
            <Switch id="email-notifications" disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="app-notifications" className="text-md">Notificaciones en la App</Label>
            <Switch id="app-notifications" checked disabled />
          </div>
           <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/30 text-sm text-blue-700 flex items-start">
                <Info className="mr-2 h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
                <span>Las opciones detalladas para las notificaciones (ej. por tipo de evento, frecuencia) estarán disponibles en futuras versiones.</span>
            </div>
        </>
      )
    },
    {
      icon: ShieldCheck,
      title: "Cuenta y Seguridad",
      description: "Gestiona la seguridad de tu cuenta y datos personales. (Funcionalidad en desarrollo)",
      content: (
        <>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Cambiar contraseña (Próximamente)">
            Cambiar Contraseña
          </Button>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Autenticación de dos factores (Próximamente)">
            Autenticación de Dos Factores (2FA)
          </Button>
          <p className="text-sm text-muted-foreground">
            Próximamente podrás gestionar tu información personal, cerrar sesiones activas y ver registros de actividad.
          </p>
          <Link href="/dashboard" passHref>
            <Button variant="outline" className="w-full">Volver al Simulador de Roles</Button>
          </Link>
        </>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Configuración General
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {settingsCards.map((setting, index) => (
          <Card 
            key={setting.title} 
            className={`shadow-md card-interactive animate-fade-in-up animation-delay-${(index + 1) * 150} border hover:border-primary/20`}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <setting.icon className="mr-3 h-6 w-6 text-primary" />
                <span>{setting.title}</span>
              </CardTitle>
              <CardDescription>
                {setting.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {setting.content}
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="mt-12 text-center text-muted-foreground animate-fade-in-up animation-delay-700">
          <Settings className="mx-auto h-10 w-10 mb-3" />
          <p>Esta sección te permite ajustar las configuraciones generales de ObraLink. Continuaremos añadiendo más opciones de personalización y control.</p>
        </div>
    </div>
  );
}
