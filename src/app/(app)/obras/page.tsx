// src/app/(app)/obras/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ObrasPage() {
  // En el futuro, aquí se listarán las obras existentes.
  // const obras = await getObrasByEmpresaId(empresaId); // Ejemplo de cómo se podrían cargar

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Gestión de Obras
        </h1>
        <Link href="/obras/new" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Nueva Obra
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="mr-3 h-6 w-6 text-primary" />
            <span>Listado de Obras</span>
          </CardTitle>
          <CardDescription>
            Aquí podrás ver y administrar todas tus obras y proyectos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <Briefcase className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg mb-2">Aún no hay obras registradas.</p>
            <p>Crea tu primera obra para empezar a gestionarla.</p>
            <Link href="/obras/new" passHref className="mt-4 inline-block">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Crear Nueva Obra
              </Button>
            </Link>
          </div>
          {/* 
          Futuro listado de obras:
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {obras.map(obra => (
              <Card key={obra.id}>
                <CardHeader>
                  <CardTitle>{obra.nombre}</CardTitle>
                  <CardDescription>{obra.direccion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Cliente: {obra.clienteNombre}</p>
                  <p>Fecha de inicio: {new Date(obra.fechaInicio).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/obras/${obra.id}`} passHref>
                    <Button variant="outline" className="w-full">Ver Detalles</Button>
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
