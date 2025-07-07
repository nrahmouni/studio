
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, HardHat, Construction, FileText, UserCheck, Fingerprint } from "lucide-react";
import { useEffect, useState } from "react";

type Role = 'encargado' | 'subcontrata_admin' | 'constructora_admin' | 'jefe_obra' | 'trabajador';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Panel Principal", icon: Home, roles: ['encargado', 'subcontrata_admin', 'constructora_admin', 'jefe_obra', 'trabajador'] },
  { href: "/encargado/reporte-diario", label: "Reporte Diario", icon: HardHat, roles: ['encargado'] },
  { href: "/subcontrata/proyectos", label: "Proyectos y Trabajadores", icon: Construction, roles: ['subcontrata_admin'] },
  { href: "/subcontrata/partes-validados", label: "Partes Validados", icon: FileText, roles: ['subcontrata_admin'] },
  { href: "/constructora/partes", label: "Ver Partes de Obra", icon: UserCheck, roles: ['constructora_admin', 'jefe_obra'] },
  { href: "/trabajador/fichar", label: "Mi Fichaje", icon: Fingerprint, roles: ['trabajador'] },
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
