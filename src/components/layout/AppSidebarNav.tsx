'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, HardHat, Construction, FileText, UserCheck, Fingerprint, Send, ListChecks, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";

type Role = 'encargado' | 'subcontrata_admin' | 'constructora_admin' | 'trabajador';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  exact?: boolean;
}

const allNavItems: NavItem[] = [
  // Encargado
  { href: "/encargado/reporte-diario", label: "Reporte Diario", icon: Send, roles: ['encargado'] },
  { href: "/encargado/partes-enviados", label: "Partes Enviados", icon: ListChecks, roles: ['encargado'] },

  // Subcontrata
  { href: "/subcontrata/proyectos", label: "Proyectos y Personal", icon: HardHat, roles: ['subcontrata_admin'] },
  { href: "/subcontrata/partes-validados", label: "Partes a Validar", icon: FileText, roles: ['subcontrata_admin'] },

  // Constructora
  { href: "/constructora/partes", label: "Seguimiento de Partes", icon: UserCheck, roles: ['constructora_admin'] },
  
  // Trabajador
  { href: "/trabajador/fichar", label: "Mi Fichaje", icon: Fingerprint, roles: ['trabajador'] },

  // Common (Settings is now common, dashboard is the role switcher)
  { href: "/settings", label: "Configuración", icon: Settings, roles: ['encargado', 'subcontrata_admin', 'constructora_admin'] },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole_obra_link') as Role | null;
      setUserRole(role);
      setIsLoadingRole(false);
    }
  }, []);

  if (isLoadingRole) {
    return (
        <nav className="flex flex-col gap-2 px-4 py-6">
            {[...Array(5)].map((_, i) => ( 
                 <div key={i} className={`h-12 w-full bg-sidebar-accent/10 rounded-md animate-pulse mb-2 animation-delay-${i * 100}`}></div>
            ))}
        </nav>
    );
  }

  const visibleNavItems = allNavItems.filter(item => {
    if (!userRole) return false; 
    return item.roles.includes(userRole);
  });

  return (
    <nav className="flex flex-col gap-2 px-4 py-6">
      {visibleNavItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
