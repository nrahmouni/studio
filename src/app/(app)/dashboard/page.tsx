'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, User, Building, HardHat, Wrench, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { seedDemoData } from '@/lib/actions/seed.actions';

type Role = 'encargado' | 'subcontrata_admin' | 'constructora_admin' | 'trabajador';
const availableRoles: { name: Role; label: string; icon: React.ElementType }[] = [
    { name: 'constructora_admin', label: 'Constructora (Admin)', icon: Building },
    { name: 'subcontrata_admin', label: 'Subcontrata (Admin)', icon: Wrench },
    { name: 'encargado', label: 'Encargado de Obra', icon: HardHat },
    { name: 'trabajador', label: 'Trabajador', icon: User },
];

const roleRedirects: Record<Role, string> = {
    encargado: '/encargado/reporte-diario',
    subcontrata_admin: '/subcontrata/proyectos',
    constructora_admin: '/constructora/partes',
    trabajador: '/trabajador/fichar',
};

function RoleSwitcher() {
  const setRole = (role: Role) => {
    localStorage.setItem('userRole_obra_link', role);
    localStorage.setItem('userId_obra_link', 'user-mock-id');
    localStorage.setItem('constructoraId_obra_link', 'const-sorigui-mock');
    localStorage.setItem('subcontrataId_obra_link', 'sub-caram-mock');
    localStorage.setItem('trabajadorId_obra_link', 'trab-01-mock');
    localStorage.setItem('encargadoId_obra_link', 'user-encargado-mock');
    window.location.reload();
  };
  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center"><Shield className="mr-2 h-6 w-6 text-primary"/> Simulador de Roles (Desarrollo)</CardTitle>
        <CardDescription>Selecciona un rol para ver su panel de control. La aplicación está usando datos de demostración sin autenticación real.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {availableRoles.map(roleInfo => (
          <Button key={roleInfo.name} onClick={() => setRole(roleInfo.name)} variant="outline" className="justify-start h-12 text-left">
             <roleInfo.icon className="mr-3 h-5 w-5 text-muted-foreground" />
             <div>
                <div>Acceder como:</div>
                <div className="font-bold capitalize">{roleInfo.label}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole_obra_link') as Role | null;
    
    if (userRole && roleRedirects[userRole]) {
      router.replace(roleRedirects[userRole]);
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleSeedData = async () => {
    setSeeding(true);
    toast({ title: "Poblando base de datos...", description: "Por favor, espera. Esto puede tardar unos segundos." });
    try {
      const result = await seedDemoData();
      if (result.success) {
        toast({ title: "Éxito", description: `${result.message} La página se recargará para mostrar los datos.` });
        setTimeout(() => window.location.reload(), 2000); // Reload after 2s to let user read the toast
      } else {
        toast({ title: "Error al Poblar Datos", description: result.message, variant: "destructive", duration: 20000 });
      }
    } catch (e: any) {
       let errorMessage = "Ocurrió un error inesperado al poblar la base de datos.";
       if (e.message && e.message.includes('504')) {
           errorMessage = "El servidor tardó demasiado en responder (Error 504). Esto puede ser un problema temporal. Por favor, inténtalo de nuevo en unos momentos.";
       } else if (e.message) {
           errorMessage = e.message;
       }
       toast({ title: "Error de Red o Servidor", description: errorMessage, variant: "destructive", duration: 20000 });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="w-full max-w-md space-y-8">
            <Card className="border-amber-500 bg-amber-500/10">
                <CardHeader>
                    <CardTitle className="text-amber-700 flex items-center"><Database className="mr-2"/>Herramienta de Datos</CardTitle>
                    <CardDescription className="text-amber-600">
                    Tu aplicación ahora usa una base de datos real. Si no ves datos, usa este botón para cargarlos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSeedData} disabled={seeding} variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-500/20">
                    {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4"/>}
                    Poblar Base de Datos de Demo
                    </Button>
                </CardContent>
            </Card>
            <RoleSwitcher />
        </div>
      </div>
  );
}
