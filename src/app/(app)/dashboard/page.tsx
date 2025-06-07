'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, FileText, Wrench, BarChart3, UserCircle } from 'lucide-react';

interface UserInfo {
  empresaId: string | null;
  usuarioId: string | null;
  role: string | null;
}

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const empresaId = localStorage.getItem('empresaId_obra_link');
      const usuarioId = localStorage.getItem('usuarioId_obra_link');
      const role = localStorage.getItem('userRole_obra_link');
      setUserInfo({ empresaId, usuarioId, role });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p>Cargando dashboard...</p></div>;
  }
  
  // For now, dashboard content is generic. Can be personalized later using userInfo.
  // e.g., if (userInfo?.role === 'trabajador') { show worker view } else { show company admin view }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary font-headline">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Obras"
          description="Gestiona tus proyectos y sitios de trabajo."
          icon={<Briefcase className="w-8 h-8 text-primary" />}
          link="/obras"
          actionText="Ver Obras"
        />
        <DashboardCard
          title="Partes de Trabajo"
          description="Crea y revisa los partes diarios."
          icon={<FileText className="w-8 h-8 text-primary" />}
          link="/partes"
          actionText="Ver Partes"
        />
        <DashboardCard
          title="Usuarios"
          description="Administra los usuarios de tu empresa."
          icon={<Users className="w-8 h-8 text-primary" />}
          link="/usuarios" // Placeholder, page to be created
          actionText="Gestionar Usuarios"
        />
         <DashboardCard
          title="Perfil de Empresa"
          description="Actualiza los datos de tu empresa."
          icon={<UserCircle className="w-8 h-8 text-primary" />}
          link="/company-profile"
          actionText="Ver Perfil"
        />
        <DashboardCard
          title="Recursos IA"
          description="Optimiza la asignación de recursos."
          icon={<Wrench className="w-8 h-8 text-primary" />}
          link="/resource-allocation"
          actionText="Analizar Recursos"
        />
        <DashboardCard
          title="Informes"
          description="Genera informes y estadísticas."
          icon={<BarChart3 className="w-8 h-8 text-primary" />}
          link="/reports" // Placeholder, page to be created
          actionText="Ver Informes"
        />
      </div>

      {userInfo && (userInfo.role === 'empresa' || userInfo.role === 'admin') && (
         <Card className="mt-10 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary font-headline">Acceso Rápido para Administradores</CardTitle>
            <CardDescription>Funciones clave para la gestión de tu empresa.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/obras/new" passHref><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Crear Nueva Obra</Button></Link>
            <Link href="/partes/new" passHref><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Nuevo Parte de Trabajo</Button></Link>
            {/* <Link href="/usuarios/new" passHref><Button variant="outline" className="w-full">Añadir Usuario</Button></Link> */}
          </CardContent>
        </Card>
      )}

       {userInfo && userInfo.role === 'trabajador' && (
         <Card className="mt-10 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary font-headline">Acceso Rápido para Trabajadores</CardTitle>
            <CardDescription>Tus herramientas diarias.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/partes/new" passHref><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Registrar Nuevo Parte</Button></Link>
            {/* <Link href="/fichajes" passHref><Button variant="outline" className="w-full">Realizar Fichaje</Button></Link> */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  actionText: string;
}

function DashboardCard({ title, description, icon, link, actionText }: DashboardCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium font-headline text-primary">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Link href={link} passHref>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">{actionText}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
