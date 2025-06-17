
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Briefcase, FileText, Users, Settings, Cpu, Building, BarChart3, Clock, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Array<'admin' | 'jefeObra' | 'trabajador'>;
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: Home, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/company-profile", label: "Perfil Empresa", icon: Building, roles: ['admin', 'jefeObra'] },
  { href: "/obras", label: "Obras", icon: Briefcase, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/partes", label: "Partes de Trabajo", icon: FileText, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/usuarios", label: "Gestión Usuarios", icon: Users, roles: ['admin', 'jefeObra'] },
  { href: "/fichajes", label: "Control Horario (Fichajes)", icon: Clock, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/control-diario", label: "Control Diario de Obra", icon: UserCheck, roles: ['admin', 'jefeObra'] }, 
  { href: "/resource-allocation", label: "Optimización Recursos (IA)", icon: Cpu, roles: ['admin', 'jefeObra'] },
  { href: "/reports", label: "Informes y Estadísticas", icon: BarChart3, roles: ['admin', 'jefeObra'] },
  { href: "/settings", label: "Configuración General", icon: Settings, roles: ['admin', 'jefeObra', 'trabajador'] },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole_obra_link');
      setUserRole(role);
      setIsLoadingRole(false);
    }
  }, []);

  if (isLoadingRole) {
    return (
        <nav className="flex flex-col gap-2 px-4 py-6">
            {[...Array(7)].map((_, i) => ( 
                 <div key={i} className={`h-12 w-full bg-sidebar-accent/10 rounded-md animate-pulse mb-2 animation-delay-${i * 100}`}></div>
            ))}
        </nav>
    );
  }

  const visibleNavItems = allNavItems.filter(item => {
    if (!userRole) return false; 
    return item.roles.includes(userRole as 'admin' | 'jefeObra' | 'trabajador');
  });

  return (
    <nav className="flex flex-col gap-2 px-4 py-6">
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Button
            asChild
            key={item.label}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-base h-12", 
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 font-semibold shadow-sm" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground",
              "transition-all duration-200 ease-in-out transform hover:scale-[1.02]" 
            )}
            title={item.label}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
