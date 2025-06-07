// src/app/(app)/settings/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Palette, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Configuración
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Palette className="mr-3 h-6 w-6 text-primary" />
              <span>Apariencia</span>
            </CardTitle>
            <CardDescription>
              Personaliza el tema y la visualización de la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-3 h-6 w-6 text-primary" />
              <span>Notificaciones</span>
            </CardTitle>
            <CardDescription>
              Gestiona tus preferencias de notificación. (En desarrollo)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
              <span>Cuenta y Seguridad</span>
            </CardTitle>
            <CardDescription>
              Actualiza tu contraseña y gestiona la seguridad. (En desarrollo)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
              Cambiar Contraseña
            </Button>
            <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
              Autenticación de Dos Factores
            </Button>
            <p className="text-sm text-muted-foreground">
              Más opciones de seguridad serán añadidas en futuras actualizaciones.
            </p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-12 text-center text-muted-foreground">
          <Settings className="mx-auto h-10 w-10 mb-3" />
          <p>Esta es la página de configuración general. Más opciones estarán disponibles a medida que la aplicación crezca.</p>
        </div>
    </div>
  );
}
