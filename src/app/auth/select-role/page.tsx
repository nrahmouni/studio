import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, User } from "lucide-react";
import Link from "next/link";

export default function SelectRolePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-primary/80 transition-colors">
          ObraLink
        </Link>
        <p className="text-muted-foreground mt-1">Planificación y entrega de partes</p>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">¿Cómo quieres acceder?</CardTitle>
          <CardDescription>Selecciona tu rol para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/login/empresa" passHref legacyBehavior>
            <Button variant="outline" className="w-full h-16 text-lg border-primary text-primary hover:bg-primary/5">
              <Building className="mr-3 h-6 w-6" />
              Soy Empresa
            </Button>
          </Link>
          <Link href="/auth/login/trabajador" passHref legacyBehavior>
            <Button variant="outline" className="w-full h-16 text-lg border-primary text-primary hover:bg-primary/5">
              <User className="mr-3 h-6 w-6" />
              Soy Trabajador
            </Button>
          </Link>
        </CardContent>
      </Card>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Nuevo por aquí? Las empresas pueden registrarse a través de un administrador.
      </p>
    </div>
  );
}
