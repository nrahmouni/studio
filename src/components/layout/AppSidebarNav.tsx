
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Briefcase, FileText, Users, Settings, Cpu, Building, BarChart3, Clock, UserCheck } from "lucide-react"; // Added UserCheck
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
  { href: "/partes", label: "Partes Diarios", icon: FileText, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ['admin', 'jefeObra'] },
  { href: "/fichajes", label: "Fichajes", icon: Clock, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/control-diario", label: "Control Diario", icon: UserCheck, roles: ['admin', 'jefeObra'] }, // Nueva entrada
  { href: "/resource-allocation", label: "Optimización IA", icon: Cpu, roles: ['admin', 'jefeObra'] },
  { href: "/reports", label: "Informes", icon: BarChart3, roles: ['admin', 'jefeObra'] },
  { href: "/settings", label: "Configuración", icon: Settings, roles: ['admin', 'jefeObra', 'trabajador'] },
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
        <nav className="flex flex-col gap-2 px-4 py-6"> {/* Increased py for more spacing */}
            {[...Array(6)].map((_, i) => ( // Show a few skeleton items
                 <div key={i} className={`h-11 w-full bg-sidebar-accent/10 rounded-md animate-pulse mb-2 animation-delay-${i * 100}`}></div>
            ))}
        </nav>
    );
  }

  const visibleNavItems = allNavItems.filter(item => {
    if (!userRole) return false; // Don't show anything if role is not determined
    return item.roles.includes(userRole as 'admin' | 'jefeObra' | 'trabajador');
  });

  return (
    <nav className="flex flex-col gap-2 px-4 py-6"> {/* Increased py */}
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Button
            asChild
            key={item.label}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-base h-12", // Slightly taller buttons
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 font-semibold shadow-sm" 
                : "text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground",
              "transition-all duration-200 ease-in-out transform hover:scale-[1.02]" // Subtle hover effect
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
