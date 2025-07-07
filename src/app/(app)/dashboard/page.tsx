'use client';
import { useEffect, useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import EncargadoDashboard from '@/components/dashboards/EncargadoDashboard';
import SubcontrataDashboard from '@/components/dashboards/SubcontrataDashboard';
import ConstructoraDashboard from '@/components/dashboards/ConstructoraDashboard';
import TrabajadorDashboard from '@/components/dashboards/TrabajadorDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Role = 'encargado' | 'subcontrata_admin' | 'constructora_admin' | 'jefe_obra' | 'trabajador';
const availableRoles: Role[] = ['encargado', 'subcontrata_admin', 'constructora_admin', 'jefe_obra', 'trabajador'];

function RoleSwitcher() {
  const setRole = (role: Role) => {
    localStorage.setItem('userRole_obra_link', role);
    // Add mock user/company IDs for other parts of the app to use
    localStorage.setItem('userId_obra_link', 'user-encargado-mock');
    localStorage.setItem('constructoraId_obra_link', 'const-sorigui-mock');
    localStorage.setItem('subcontrataId_obra_link', 'sub-caram-mock');
    localStorage.setItem('trabajadorId_obra_link', 'trab-01-mock');
    window.location.reload();
  };
  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center"><Shield className="mr-2 h-6 w-6 text-primary"/> Simulador de Roles (Desarrollo)</CardTitle>
        <CardDescription>Selecciona un rol para ver su panel de control. No hay un sistema de login real activo.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {availableRoles.map(role => (
          <Button key={role} onClick={() => setRole(role)} variant="outline">
            Acceder como: <span className="font-bold ml-1 capitalize">{role.replace(/_/g, ' ')}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This now runs only on the client
    const userRole = localStorage.getItem('userRole_obra_link') as Role | null;
    if (userRole) {
      setRole(userRole);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If no role is set, show the role switcher
  if (!role) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <RoleSwitcher />
      </div>
    );
  }

  // Render the dashboard based on the selected role
  const renderDashboardByRole = () => {
    switch (role) {
      case 'encargado':
        return <EncargadoDashboard />;
      case 'subcontrata_admin':
        return <SubcontrataDashboard />;
      case 'constructora_admin':
      case 'jefe_obra':
        return <ConstructoraDashboard />;
      case 'trabajador':
         return <TrabajadorDashboard />;
      default:
        // This case should ideally not be reached if a role is set
        return <div className="text-center"><p>Rol no reconocido.</p></div>;
    }
  };

  return <div className="container mx-auto py-8 px-4">{renderDashboardByRole()}</div>;
}
