
"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, UserCircle, LogOut, Sun, Moon } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import Image
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
      localStorage.removeItem('empresaId_obra_link');
      localStorage.removeItem('usuarioId_obra_link');
      localStorage.removeItem('userRole_obra_link');
    }
    router.push('/auth/select-role');
  };


  if (!mounted) {
    return ( 
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" /> 
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
                   {companyName === "ObraLink" ? (
                    <Image
                      src="/obralink-logo.png"
                      alt="ObraLink Logo"
                      width={150}
                      height={34}
                    />
                  ) : (
                    <h1 className="text-xl font-bold font-headline text-sidebar-primary">{companyName}</h1>
                  )}
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
            {companyName === "ObraLink" ? (
              <Image
                src="/obralink-logo.png"
                alt="ObraLink Logo"
                width={160}
                height={36}
                priority
              />
            ) : (
              <h1 className="text-xl font-bold font-headline text-primary">{companyName}</h1>
            )}
          </Link>
        </div>

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
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
