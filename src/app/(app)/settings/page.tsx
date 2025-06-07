// src/app/(app)/settings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Palette, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const settingsCards = [
    {
      icon: Palette,
      title: "Apariencia",
      description: "Personaliza el tema y la visualización de la aplicación.",
      content: (
        <>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-switch" className="text-md">Modo Oscuro</Label>
            <Switch id="dark-mode-switch" disabled title="Funcionalidad de tema en cabecera" />
          </div>
          <p className="text-sm text-muted-foreground">
            El cambio de tema (claro/oscuro) se gestiona desde el icono en la cabecera.
          </p>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
            Más Opciones de Tema (Próximamente)
          </Button>
        </>
      )
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Gestiona tus preferencias de notificación. (En desarrollo)",
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
          <p className="text-sm text-muted-foreground">
            Configuraciones detalladas de notificación estarán disponibles pronto.
          </p>
        </>
      )
    },
    {
      icon: ShieldCheck,
      title: "Cuenta y Seguridad",
      description: "Actualiza tu contraseña y gestiona la seguridad. (En desarrollo)",
      content: (
        <>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
            Cambiar Contraseña
          </Button>
          <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
            Autenticación de Dos Factores
          </Button>
          <p className="text-sm text-muted-foreground">
            Más opciones de seguridad serán añadidas en futuras actualizaciones.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Configuración
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((setting, index) => (
          <Card 
            key={setting.title} 
            className={`shadow-md card-interactive animate-fade-in-up animation-delay-${(index + 1) * 150}`}
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
          <p>Esta es la página de configuración general. Más opciones estarán disponibles a medida que la aplicación crezca.</p>
        </div>
    </div>
  );
}
