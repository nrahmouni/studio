
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Loader2, AlertTriangle, Mail, Briefcase, Edit2, ShieldCheck, ShieldOff, Fingerprint } from "lucide-react";
import Link from "next/link";
import { getUsuariosByEmpresaId } from '@/lib/actions/user.actions';
import type { UsuarioFirebase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

const getRolDisplay = (rol: UsuarioFirebase['rol']): string => {
  switch (rol) {
    case 'admin': return 'Administrador';
    case 'jefeObra': return 'Jefe de Obra';
    case 'trabajador': return 'Trabajador';
    default:
      const exhaustiveCheck: never = rol;
      return exhaustiveCheck;
  }
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioFirebase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsuarios = async () => {
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
        const fetchedUsuarios = await getUsuariosByEmpresaId(storedEmpresaId);
        setUsuarios(fetchedUsuarios);
      } catch (err: any) { 
        console.error("Error fetching usuarios:", err);
        setError("No se pudieron cargar los usuarios. Inténtelo de nuevo más tarde.");
        toast({ title: "Error de Carga", description: "No se pudieron cargar los usuarios.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuarios();
  }, [toast]); 

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Gestión de Usuarios
        </h1>
         <Link href="/company-profile" passHref>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <UserPlus className="mr-2 h-5 w-5" />
                Añadir Trabajador
            </Button>
         </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Cargando usuarios...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Error al Cargar Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4 border-destructive text-destructive hover:bg-destructive/20"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && usuarios.length === 0 && (
        <Card className="shadow-lg border-border animate-fade-in-up">
          <CardHeader className="items-center text-center p-6">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Users className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline text-primary">No Hay Usuarios Registrados</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Actualmente no hay usuarios para mostrar en esta empresa.
              <br />
              Puedes añadir nuevos trabajadores desde la sección de Perfil de Empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
             <Link href="/company-profile" passHref>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <UserPlus className="mr-2 h-4 w-4" /> Añadir Primer Trabajador
                </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && usuarios.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-6 animate-fade-in-down">Mostrando {usuarios.length} usuario(s).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((usuario, index) => {
              const obrasAsignadasActuales = usuario.obrasAsignadas ?? []; 
              return (
                <Card 
                  key={usuario.id} 
                  className={cn(
                    "flex flex-col bg-card border-border rounded-lg overflow-hidden card-interactive",
                    `animate-fade-in-up animation-delay-${(index + 1) * 100}`
                  )}
                >
                  <CardHeader className="p-5 bg-primary/5">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-xl font-headline text-primary">{usuario.nombre}</CardTitle>
                      <Badge 
                        variant={usuario.activo ? "default" : "destructive"} 
                        className={cn(
                            "text-xs px-2.5 py-1 font-medium",
                            usuario.activo 
                                ? "bg-green-100 text-green-700 border border-green-300 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600" 
                                : "bg-red-100 text-red-700 border border-red-300 dark:bg-red-700/20 dark:text-red-300 dark:border-red-600"
                        )}
                      >
                        {usuario.activo ? <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> : <ShieldOff className="mr-1.5 h-3.5 w-3.5" />}
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
                      <Mail className="mr-2 h-4 w-4" /> {usuario.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 flex-grow space-y-3 text-sm">
                    <div className="flex items-center text-foreground/90">
                      <Fingerprint className="mr-2 h-4 w-4 text-accent" />
                      <span className="font-medium">DNI:</span>&nbsp;{usuario.dni}
                    </div>
                    <div className="flex items-center text-foreground/90">
                      <Briefcase className="mr-2 h-4 w-4 text-accent" />
                      <span className="font-medium">Rol:</span>&nbsp;{getRolDisplay(usuario.rol)}
                    </div>
                    {obrasAsignadasActuales.length > 0 && (
                      <div className="flex items-start text-foreground/90">
                        <Briefcase className="mr-2 h-4 w-4 text-accent mt-0.5 shrink-0" />
                        <div>
                            <span className="font-medium">Obras Asignadas:</span>&nbsp;
                            <span className="text-muted-foreground">{obrasAsignadasActuales.length}</span>
                        </div>
                      </div>
                    )}
                     {obrasAsignadasActuales.length === 0 && (
                      <div className="flex items-center text-muted-foreground">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Sin obras asignadas</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 border-t border-border bg-muted/20">
                    <Link href={`/usuarios/${usuario.id}/edit`} passHref className="w-full">
                      <Button variant="outline" className="w-full border-primary/50 text-primary hover:border-primary hover:bg-primary/10">
                        <Edit2 className="mr-2 h-4 w-4" /> Ver / Editar Perfil
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

