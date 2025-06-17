
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User, HardHat, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SelectRolePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-primary/10">
      <div className="mb-8 text-center animate-fade-in-down">
        <Link href="/" className="text-4xl font-bold font-headline text-primary hover:text-primary/80 transition-colors">
          ObraLink
        </Link>
        <p className="text-muted-foreground mt-2">Planificación y gestión eficiente para tus obras.</p>
      </div>
      <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">¿Cómo quieres acceder?</CardTitle>
          <CardDescription>Selecciona tu rol para continuar o registra tu empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/login/empresa" passHref>
            <Button variant="outline" className="w-full h-16 text-lg border-primary text-primary hover:bg-primary/5 hover:shadow-md transition-all">
              <Building className="mr-3 h-6 w-6" />
              Soy Admin de Empresa
            </Button>
          </Link>
           <Link href="/auth/login/empresa" passHref>
            <Button variant="outline" className="w-full h-16 text-lg border-primary text-primary hover:bg-primary/5 hover:shadow-md transition-all">
              <HardHat className="mr-3 h-6 w-6" />
              Soy Encargado/Jefe de Obra
            </Button>
          </Link>
          <Link href="/auth/login/trabajador" passHref>
            <Button variant="outline" className="w-full h-16 text-lg border-primary text-primary hover:bg-primary/5 hover:shadow-md transition-all">
              <User className="mr-3 h-6 w-6" />
              Soy Trabajador
            </Button>
          </Link>
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs">¿NUEVA EMPRESA?</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <Link href="/auth/register/empresa" passHref>
            <Button variant="default" className="w-full h-16 text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all">
              <UserPlus className="mr-3 h-6 w-6" />
              Registrar mi Empresa
            </Button>
          </Link>
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground animate-fade-in-up animation-delay-200">
        Simplifica la gestión de tus proyectos con ObraLink.
      </p>
    </div>
  );
}
