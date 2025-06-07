
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Briefcase, Users, FileText, Wrench, BarChart3, Building } from 'lucide-react';

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
    return <div className="flex items-center justify-center h-screen"><p className="text-muted-foreground">Cargando dashboard...</p></div>;
  }
  
  const isAdminOrEmpresa = userInfo?.role === 'empresa' || userInfo?.role === 'admin' || userInfo?.role === 'jefeObra';
  const isTrabajador = userInfo?.role === 'trabajador';

  const commonCards = [
    { title: "Partes de Trabajo", description: isAdminOrEmpresa ? "Crea y revisa los partes diarios." : "Registra y consulta tus partes.", icon: <FileText className="w-8 h-8 text-primary" />, link: "/partes", actionText: isAdminOrEmpresa ? "Ver Partes" : "Mis Partes" },
    { title: "Obras", description: isAdminOrEmpresa ? "Gestiona tus proyectos y sitios de trabajo." : "Consulta las obras asignadas.", icon: <Briefcase className="w-8 h-8 text-primary" />, link: "/obras", actionText: isAdminOrEmpresa ? "Ver Obras" : "Consultar Obras" },
  ];

  const adminCards = [
    { title: "Usuarios", description: "Administra los usuarios de tu empresa.", icon: <Users className="w-8 h-8 text-primary" />, link: "/usuarios", actionText: "Gestionar Usuarios" },
    { title: "Perfil de Empresa", description: "Actualiza los datos de tu empresa.", icon: <Building className="w-8 h-8 text-primary" />, link: "/company-profile", actionText: "Ver Perfil" },
    { title: "Recursos IA", description: "Optimiza la asignación de recursos.", icon: <Wrench className="w-8 h-8 text-primary" />, link: "/resource-allocation", actionText: "Analizar Recursos" },
    { title: "Informes", description: "Genera informes y estadísticas.", icon: <BarChart3 className="w-8 h-8 text-primary" />, link: "/reports", actionText: "Ver Informes" },
  ];

  const cardsToDisplay = isAdminOrEmpresa ? [...commonCards, ...adminCards] : commonCards;


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary font-headline animate-fade-in-down">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsToDisplay.map((card, index) => (
            <DashboardCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                link={card.link}
                actionText={card.actionText}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100}`}
            />
        ))}
      </div>

      {isAdminOrEmpresa && (
         <Card className="mt-10 bg-primary/5 border-primary/20 animate-fade-in-up animation-delay-700">
          <CardHeader>
            <CardTitle className="text-primary font-headline">Acceso Rápido para Gestores</CardTitle>
            <CardDescription>Funciones clave para la administración.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/obras/new" passHref><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Crear Nueva Obra</Button></Link>
            <Link href="/partes/new" passHref><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Nuevo Parte de Trabajo</Button></Link>
          </CardContent>
        </Card>
      )}

       {isTrabajador && (
         <Card className="mt-10 bg-primary/5 border-primary/20 animate-fade-in-up animation-delay-300">
          <CardHeader>
            <CardTitle className="text-primary font-headline">Acceso Rápido para Trabajadores</CardTitle>
            <CardDescription>Tus herramientas diarias.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/partes/new" passHref><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Registrar Nuevo Parte</Button></Link>
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
  className?: string;
}

function DashboardCard({ title, description, icon, link, actionText, className }: DashboardCardProps) {
  return (
    <Card className={`card-interactive ${className}`}>
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
