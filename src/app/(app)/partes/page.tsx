// src/app/(app)/partes/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function PartesPage() {
  // En el futuro, aquí se listarán los partes de trabajo.
  // const partes = await getPartesByEmpresaId(empresaId); // Ejemplo

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Partes de Trabajo
        </h1>
        <Link href="/partes/new" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Nuevo Parte
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-3 h-6 w-6 text-primary" />
            <span>Listado de Partes de Trabajo</span>
          </CardTitle>
          <CardDescription>
            Consulta y gestiona los partes de trabajo diarios de tus obras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg mb-2">Aún no hay partes de trabajo registrados.</p>
            <p>Crea tu primer parte para empezar.</p>
            <Link href="/partes/new" passHref className="mt-4 inline-block">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Registrar Nuevo Parte
              </Button>
            </Link>
          </div>
          {/* 
          Futuro listado de partes:
          <div className="space-y-4 mt-6">
            {partes.map(parte => (
              <Card key={parte.id}>
                <CardHeader>
                  <CardTitle>Parte del {new Date(parte.fecha).toLocaleDateString()}</CardTitle>
                  <CardDescription>Obra: {parte.obraNombre} - Trabajador: {parte.usuarioNombre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Tareas: {parte.tareasRealizadas.substring(0,100)}...</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/partes/${parte.id}`} passHref>
                    <Button variant="outline" className="w-full">Ver Parte Completo</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div> 
          */}
        </CardContent>
      </Card>
    </div>
  );
}
