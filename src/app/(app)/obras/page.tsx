// src/app/(app)/obras/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, PlusCircle, Loader2, AlertTriangle, Eye, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import type { Obra } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// import { deleteObra } from '@/lib/actions/obra.actions'; // Placeholder for delete action

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchObras = async () => {
      setIsLoading(true);
      setError(null);
      const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
      if (!storedEmpresaId) {
        setError("ID de empresa no encontrado. Por favor, inicie sesión de nuevo.");
        setIsLoading(false);
        toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
        return;
      }

      try {
        const fetchedObras = await getObrasByEmpresaId(storedEmpresaId);
        setObras(fetchedObras);
      } catch (err) {
        console.error("Error fetching obras:", err);
        setError("No se pudieron cargar las obras. Inténtelo de nuevo más tarde.");
        toast({ title: "Error de Carga", description: "No se pudieron cargar las obras.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchObras();
  }, [toast]);

  // const handleDeleteObra = async (obraId: string) => {
  //   const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
  //   if (!storedEmpresaId) {
  //     toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
  //     return;
  //   }
  //   if (!confirm(`¿Está seguro de que desea eliminar la obra con ID ${obraId}? Esta acción no se puede deshacer.`)) {
  //     return;
  //   }
  //   try {
  //     // const result = await deleteObra(obraId, storedEmpresaId);
  //     // if (result.success) {
  //     //   toast({ title: "Éxito", description: result.message });
  //     //   setObras(prevObras => prevObras.filter(obra => obra.id !== obraId));
  //     // } else {
  //     //   toast({ title: "Error", description: result.message, variant: "destructive" });
  //     // }
  //     toast({title: "Simulación", description: `La obra ${obraId} sería eliminada.`});
  //     setObras(prevObras => prevObras.filter(obra => obra.id !== obraId)); // Simulación
  //   } catch (error) {
  //     toast({ title: "Error Inesperado", description: "No se pudo eliminar la obra.", variant: "destructive" });
  //   }
  // };


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

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Cargando obras...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Error al Cargar Obras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive/20">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && obras.length === 0 && (
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
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && obras.length > 0 && (
        <>
          <p className="text-muted-foreground mb-6">Mostrando {obras.length} obra(s).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obras.map(obra => (
              <Card key={obra.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-headline text-primary hover:underline">
                    <Link href={`/obras/${obra.id}`}>{obra.nombre}</Link>
                  </CardTitle>
                  <CardDescription>{obra.direccion}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <p><span className="font-semibold">Cliente:</span> {obra.clienteNombre}</p>
                  <p><span className="font-semibold">Inicio:</span> {new Date(obra.fechaInicio).toLocaleDateString()}</p>
                  {obra.fechaFin && <p><span className="font-semibold">Fin Previsto:</span> {new Date(obra.fechaFin).toLocaleDateString()}</p>}
                  <p><span className="font-semibold text-sm">Estado:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${obra.fechaFin && new Date(obra.fechaFin) < new Date() ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {obra.fechaFin && new Date(obra.fechaFin) < new Date() ? 'Finalizada' : 'En Curso'}
                  </span></p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                   <Link href={`/obras/${obra.id}/edit`} passHref>
                    <Button variant="outline" size="sm" className="text-muted-foreground hover:text-primary hover:border-primary" title="Editar Obra (Próximamente)">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-muted-foreground hover:text-destructive hover:border-destructive opacity-50 cursor-not-allowed" 
                    title="Eliminar Obra (Próximamente)"
                    // onClick={() => handleDeleteObra(obra.id)} // Funcionalidad de borrado futura
                    disabled 
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link href={`/obras/${obra.id}`} passHref>
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
