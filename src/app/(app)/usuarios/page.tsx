
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Loader2, AlertTriangle, Mail, Briefcase, Edit2, ShieldCheck, ShieldOff } from "lucide-react";
import Link from "next/link";
import { getUsuariosByEmpresaId } from '@/lib/actions/user.actions';
import type { UsuarioFirebase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const getRolDisplay = (rol: UsuarioFirebase['rol']): string => {
  switch (rol) {
    case 'admin': return 'Administrador';
    case 'jefeObra': return 'Jefe de Obra';
    case 'trabajador': return 'Trabajador';
    default: return rol;
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Gestión de Usuarios
        </h1>
         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
            <UserPlus className="mr-2 h-5 w-5" />
            Añadir Usuario (Próximamente)
          </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Cargando usuarios...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive">
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      )}

      {!isLoading && !error && usuarios.length === 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-3 h-6 w-6 text-primary" /><span>Listado de Usuarios</span></CardTitle>
            <CardDescription>Administra los perfiles y accesos de los trabajadores y gestores de tu empresa.</CardDescription>
          </Header>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg mb-2">No hay usuarios registrados para esta empresa.</p>
              <p>La funcionalidad para añadir nuevos usuarios estará disponible próximamente.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && usuarios.length > 0 && (
        <>
          <p className="text-muted-foreground mb-6">Mostrando {usuarios.length} usuario(s).</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map(usuario => {
              const obrasAsignadasCurrent = usuario.obrasAsignadas;
              return (
                <Card key={usuario.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-headline text-primary">{usuario.nombre}</CardTitle>
                      <Badge variant={usuario.activo ? "secondary" : "destructive"} className={usuario.activo ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        {usuario.activo ? <ShieldCheck className="mr-1 h-3 w-3" /> : <ShieldOff className="mr-1 h-3 w-3" />}
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {usuario.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2 text-sm">
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Rol:</span>&nbsp;{getRolDisplay(usuario.rol)}
                    </div>
                    {obrasAsignadasCurrent && obrasAsignadasCurrent.length > 0 && (
                      <p><span className="font-medium">Obras Asignadas:</span> {obrasAsignadasCurrent.length}</p>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Link href={`/usuarios/${usuario.id}/edit`} passHref className="w-full">
                      <Button variant="outline" className="w-full">
                        <Edit2 className="mr-2 h-4 w-4" /> Editar Usuario
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
