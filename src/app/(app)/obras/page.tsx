
// src/app/(app)/obras/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, PlusCircle, Loader2, AlertTriangle, Eye, Edit3, Trash2, Info } from "lucide-react";
import Link from "next/link";
import { getObrasByEmpresaId, deleteObra } from '@/lib/actions/obra.actions';
import type { Obra } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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
        toast({ title: "Error de Autenticación", description: "ID de empresa no disponible.", variant: "destructive" });
        return;
      }

      try {
        const fetchedObras = await getObrasByEmpresaId(storedEmpresaId);
        setObras(fetchedObras.sort((a,b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()));
      } catch (err) {
        console.error("Error fetching obras:", err);
        setError("No se pudieron cargar las obras. Inténtelo de nuevo más tarde.");
        toast({ title: "Error de Carga", description: "No se pudieron cargar los datos de las obras.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchObras();
  }, [toast]);

  const handleDeleteObra = async (obraId: string, obraNombre: string) => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (!storedEmpresaId) {
      toast({ title: "Error de Autenticación", description: "ID de empresa no disponible para esta acción.", variant: "destructive" });
      return;
    }
  
    try {
      const result = await deleteObra(obraId, storedEmpresaId);
      if (result.success) {
        toast({ title: "Obra Eliminada", description: `La obra "${obraNombre}" ha sido eliminada correctamente.` });
        setObras(prevObras => prevObras.filter(obra => obra.id !== obraId));
      } else {
        toast({ title: "Error al Eliminar", description: result.message || `No se pudo eliminar la obra "${obraNombre}".`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error Inesperado", description: `Ocurrió un error al intentar eliminar la obra "${obraNombre}".`, variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Gestión de Obras y Proyectos
        </h1>
        <Link href="/obras/new" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Crear Nueva Obra
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Cargando obras...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Error al Cargar Obras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive/20">
              Reintentar Carga
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && obras.length === 0 && (
        <Card className="shadow-lg animate-fade-in-up border-dashed">
          <CardHeader className="items-center text-center p-8">
             <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Briefcase className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline text-primary">No Hay Obras Registradas</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Parece que aún no has añadido ninguna obra o proyecto.
              <br />
              ¡Crea tu primera obra para empezar a gestionarla!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link href="/obras/new" passHref>
              <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                 <PlusCircle className="mr-2 h-5 w-5" /> Crear Mi Primera Obra
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && obras.length > 0 && (
        <>
          <p className="text-muted-foreground mb-6 animate-fade-in-down">Mostrando {obras.length} obra(s) activas y finalizadas.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obras.map((obra, index) => (
              <Card 
                key={obra.id} 
                className={`flex flex-col card-interactive animate-fade-in-up animation-delay-${(index + 1) * 100} border hover:border-primary/30`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-headline text-primary hover:underline">
                    <Link href={`/obras/${obra.id}`}>{obra.nombre}</Link>
                  </CardTitle>
                  <CardDescription>{obra.direccion}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                  <p><span className="font-semibold">Cliente:</span> {obra.clienteNombre}</p>
                  <p><span className="font-semibold">Inicio:</span> {new Date(obra.fechaInicio).toLocaleDateString('es-ES', {day: '2-digit', month: 'short', year: 'numeric'})}</p>
                  {obra.fechaFin && <p><span className="font-semibold">Fin Previsto:</span> {new Date(obra.fechaFin).toLocaleDateString('es-ES', {day: '2-digit', month: 'short', year: 'numeric'})}</p>}
                  <p><span className="font-semibold text-sm">Estado:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${obra.fechaFin && new Date(obra.fechaFin) < new Date() ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {obra.fechaFin && new Date(obra.fechaFin) < new Date() ? 'Finalizada' : 'En Curso'}
                  </span></p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                   <Link href={`/obras/${obra.id}/edit`} passHref>
                    <Button variant="outline" size="sm" className="text-muted-foreground hover:text-primary hover:border-primary" title="Editar Obra">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-muted-foreground hover:text-destructive hover:border-destructive" 
                        title="Eliminar Obra"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar la obra "{obra.nombre}"? Esta acción es irreversible y se borrarán todos los datos asociados a ella (partes de trabajo, etc.).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteObra(obra.id, obra.nombre)} className="bg-destructive hover:bg-destructive/90">
                          Sí, eliminar obra
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
