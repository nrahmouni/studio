'use client';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import EncargadoDashboard from '@/components/dashboards/EncargadoDashboard';
import SubcontrataDashboard from '@/components/dashboards/SubcontrataDashboard';
import ConstructoraDashboard from '@/components/dashboards/ConstructoraDashboard';
import TrabajadorDashboard from '@/components/dashboards/TrabajadorDashboard';
import { useRouter } from 'next/navigation';

type Role = 'encargado' | 'subcontrata_admin' | 'constructora_admin' | 'jefe_obra' | 'trabajador';

export default function DashboardPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole_obra_link') as Role | null;
    if (userRole) {
      setRole(userRole);
    } else {
      // If no role is found, redirect to login selection
      router.push('/auth/select-role');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando dashboard...</p>
      </div>
    );
  }

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
        return <div className="text-center"><p>Rol no reconocido. Redirigiendo...</p></div>;
    }
  };

  return <div className="container mx-auto py-8 px-4">{renderDashboardByRole()}</div>;
}
