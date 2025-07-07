
"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, UserCircle, LogOut, Sun, Moon, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebarNav } from "./AppSidebarNav"; 
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


interface AppHeaderProps {
  companyName?: string;
}

export function AppHeader({ companyName = "ObraLink" }: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme_obra_link');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
    const role = localStorage.getItem('userRole_obra_link');
    setCurrentRole(role);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_obra_link', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_obra_link', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Clear all mock session keys
      localStorage.removeItem('userRole_obra_link');
      localStorage.removeItem('userId_obra_link');
      localStorage.removeItem('constructoraId_obra_link');
      localStorage.removeItem('subcontrataId_obra_link');
      localStorage.removeItem('trabajadorId_obra_link');
      localStorage.removeItem('encargadoId_obra_link'); // Added missing key

      // Force a full page navigation and reload to ensure state is reset
      window.location.href = '/dashboard';
    }
  };


  if (!mounted) {
    return ( 
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-9 w-40 bg-muted rounded animate-pulse" /> 
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" /> 
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" /> 
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm print:hidden">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground p-0">
              <SheetHeader className="p-4 border-b border-sidebar-border">
                <SheetTitle asChild>
                   {/* Ensure consistent logo usage here */}
                    <Image
                      src="https://placehold.co/160x36.png" 
                      alt="Logo de ObraLink"
                      width={160}
                      height={36}
                      priority
                      data-ai-hint="logo"
                    />
                </SheetTitle>
                <SheetDescription className="text-sidebar-muted-foreground">
                  Menú de Navegación
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <AppSidebarNav />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="hidden md:block">
             {/* Ensure consistent logo usage here */}
              <Image
                src="https://placehold.co/160x36.png" 
                alt="Logo de ObraLink"
                width={160}
                height={36}
                priority
                data-ai-hint="logo"
              />
          </Link>
        </div>
        
        {currentRole && 
            <div className="hidden md:flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Rol Activo:</span>
                <span className="capitalize font-semibold text-primary">{currentRole.replace(/_/g, ' ')}</span>
            </div>
        }

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
                <span className="sr-only">Menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/company-profile" passHref>
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings" passHref> 
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cambiar de Rol</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
