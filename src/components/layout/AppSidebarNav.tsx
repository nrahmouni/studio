
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Briefcase, FileText, Users, Settings, Cpu, Building, BarChart3, Clock, UserCircle } from "lucide-react"; // Added Clock

const navItems = [
  { href: "/dashboard", label: "Panel Principal", icon: Home },
  { href: "/company-profile", label: "Perfil Empresa", icon: Building },
  { href: "/obras", label: "Obras", icon: Briefcase },
  { href: "/partes", label: "Partes", icon: FileText },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/fichajes", label: "Fichajes", icon: Clock },
  { href: "/resource-allocation", label: "Optimización IA", icon: Cpu },
  { href: "/reports", label: "Informes", icon: BarChart3 },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-4 py-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link href={item.href} key={item.label}>
            <Button
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
