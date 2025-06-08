
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Briefcase, FileText, Users, Settings, Cpu, Building, BarChart3, Clock } from "lucide-react";
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
  { href: "/partes", label: "Partes", icon: FileText, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/usuarios", label: "Usuarios", icon: Users, roles: ['admin', 'jefeObra'] },
  { href: "/fichajes", label: "Fichajes", icon: Clock, roles: ['admin', 'jefeObra', 'trabajador'] },
  { href: "/resource-allocation", label: "Optimización IA", icon: Cpu, roles: ['admin', 'jefeObra'] },
  { href: "/reports", label: "Informes", icon: BarChart3, roles: ['admin', 'jefeObra'] },
  { href: "/settings", label: "Configuración", icon: Settings, roles: ['admin', 'jefeObra', 'trabajador'] },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole_obra_link');
      setUserRole(role);
      setIsLoadingRole(false);
    }
  }, []);

  if (isLoadingRole) {
    // You can render a skeleton loader here if preferred
    return (
        <nav className="flex flex-col gap-2 px-4 py-2">
            {/* Example of a few skeleton items */}
            <div className="h-11 w-full bg-muted/50 rounded-md animate-pulse"></div>
            <div className="h-11 w-full bg-muted/50 rounded-md animate-pulse animation-delay-100"></div>
            <div className="h-11 w-full bg-muted/50 rounded-md animate-pulse animation-delay-200"></div>
        </nav>
    );
  }

  const visibleNavItems = allNavItems.filter(item => {
    if (!userRole) return false; // Should not happen if logged in
    return item.roles.includes(userRole as 'admin' | 'jefeObra' | 'trabajador');
  });

  return (
    <nav className="flex flex-col gap-2 px-4 py-2">
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link href={item.href} key={item.label} passHref legacyBehavior>
            <Button
              as="a" // Make button behave like an anchor for Next.js Link
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-base h-11",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90",
                !isActive && "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
