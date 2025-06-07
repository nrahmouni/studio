// src/app/(app)/usuarios/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";

export default function UsuariosPage() {
  // Futuro: Cargar usuarios de la empresa actual
  // const usuarios = await getUsuariosByEmpresaId(empresaId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Gestión de Usuarios
        </h1>
        {/* Link para crear nuevo usuario (a implementar) */}
        {/* <Link href="/usuarios/new" passHref>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <UserPlus className="mr-2 h-5 w-5" />
            Añadir Usuario
          </Button>
        </Link> */}
         <Button className="bg-primary hover:bg-primary/90 text-primary-foreground opacity-50 cursor-not-allowed" title="Funcionalidad en desarrollo">
            <UserPlus className="mr-2 h-5 w-5" />
            Añadir Usuario (Próximamente)
          </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary" />
            <span>Listado de Usuarios</span>
          </CardTitle>
          <CardDescription>
            Administra los perfiles y accesos de los trabajadores y gestores de tu empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg mb-2">La gestión de usuarios está en desarrollo.</p>
            <p>Próximamente podrás añadir, editar y gestionar los roles de los usuarios de tu empresa.</p>
          </div>
          {/* 
          Futuro listado de usuarios:
          <div className="space-y-4 mt-6">
            {usuarios.map(usuario => (
              <Card key={usuario.id}>
                <CardHeader>
                  <CardTitle>{usuario.nombre}</CardTitle>
                  <CardDescription>Email: {usuario.email} - Rol: {usuario.rol}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Activo: {usuario.activo ? 'Sí' : 'No'}</p>
                  <p>Obras asignadas: {usuario.obrasAsignadas?.join(', ') || 'Ninguna'}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Editar Usuario (Próximamente)</Button>
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
