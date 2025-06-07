// src/app/(app)/usuarios/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCog, ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { getUsuarioById, updateUsuario } from '@/lib/actions/user.actions';
import { UsuarioFirebaseSchema, type UsuarioFirebase } from '@/lib/types';

// Schema for the form, omitting id, empresaId, password (password change should be separate)
const UsuarioEditFormSchema = UsuarioFirebaseSchema.omit({ 
  id: true, 
  empresaId: true, 
  password: true 
}).extend({
  // obrasAsignadas could be a multi-select in a real app, for now, not directly editable here
  // It might be managed through a separate interface or based on obra assignments.
  // For this form, we'll mainly focus on nombre, email, rol, activo.
  obrasAsignadas: z.array(z.string()).optional(), // Keep it for display, but not primary focus of edit
});
type UsuarioEditFormData = z.infer<typeof UsuarioEditFormSchema>;

export default function EditUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const usuarioId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmpresaId, setCurrentEmpresaId] = useState<string | null>(null);

  const form = useForm<UsuarioEditFormData>({
    resolver: zodResolver(UsuarioEditFormSchema),
    defaultValues: {
      nombre: '',
      email: '',
      rol: 'trabajador', // Default role
      activo: true,
      obrasAsignadas: [],
    },
  });

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (storedEmpresaId) {
      setCurrentEmpresaId(storedEmpresaId);
    } else {
      toast({ title: "Error", description: "ID de empresa no encontrado para autorización.", variant: "destructive" });
      router.push('/auth/login/empresa');
      return;
    }

    const fetchUsuario = async () => {
      if (!usuarioId) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedUsuario = await getUsuarioById(usuarioId);
        if (fetchedUsuario) {
          if (fetchedUsuario.empresaId !== storedEmpresaId) {
             setError("No tienes permiso para editar este usuario.");
             toast({ title: "No Autorizado", description: "No puedes editar usuarios de otra empresa.", variant: "destructive" });
             setIsLoading(false);
             return;
          }
          form.reset({
            nombre: fetchedUsuario.nombre,
            email: fetchedUsuario.email,
            rol: fetchedUsuario.rol,
            activo: fetchedUsuario.activo,
            obrasAsignadas: fetchedUsuario.obrasAsignadas || [],
          });
        } else {
          setError("Usuario no encontrado.");
          toast({ title: "Error", description: "Usuario no encontrado.", variant: "destructive" });
        }
      } catch (err) {
        setError("Error al cargar el usuario.");
        toast({ title: "Error de Carga", description: "No se pudo cargar el usuario.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsuario();
  }, [usuarioId, form, router, toast]);

  const onSubmit = async (data: UsuarioEditFormData) => {
    if (!usuarioId || !currentEmpresaId) return;
    setIsSubmitting(true);
    try {
      // We pass only the editable fields to updateUsuario
      const { obrasAsignadas, ...updateData } = data; // Exclude obrasAsignadas for now if not editable
      const result = await updateUsuario(usuarioId, currentEmpresaId, updateData);
      if (result.success && result.usuario) {
        toast({ title: 'Éxito', description: `Usuario "${result.usuario.nombre}" actualizado.` });
        router.push('/usuarios');
      } else {
        toast({ title: 'Error al Guardar', description: result.message || 'No se pudo actualizar el usuario.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error Inesperado', description: 'Ocurrió un error al guardar.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg">Cargando usuario...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-destructive/10 border-destructive text-destructive"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent>
        <CardFooter><Button variant="outline" onClick={() => router.push('/usuarios')} className="border-destructive text-destructive hover:bg-destructive/20"><ArrowLeft className="mr-2 h-4 w-4"/>Volver</Button></CardFooter></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" onClick={() => router.push('/usuarios')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado de Usuarios
      </Button>
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <UserCog className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Editar Usuario</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Modifica los detalles y permisos del usuario.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="nombre" className="font-semibold">Nombre Completo</Label>
              <Input id="nombre" {...form.register('nombre')} className="mt-1" />
              {form.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input id="email" type="email" {...form.register('email')} className="mt-1" />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                <Label htmlFor="rol" className="font-semibold">Rol</Label>
                <Controller
                    name="rol"
                    control={form.control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="trabajador">Trabajador</SelectItem>
                        <SelectItem value="jefeObra">Jefe de Obra</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                    </Select>
                    )}
                />
                {form.formState.errors.rol && <p className="text-sm text-destructive mt-1">{form.formState.errors.rol.message}</p>}
                </div>
                
                <div className="flex flex-col justify-center pt-2">
                    <Label htmlFor="activo" className="font-semibold mb-2">Estado</Label>
                    <div className="flex items-center space-x-2">
                    <Controller
                        name="activo"
                        control={form.control}
                        render={({ field }) => (
                            <Switch
                            id="activo"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        )}
                        />
                    <Label htmlFor="activo" className="text-sm text-muted-foreground">{form.getValues("activo") ? "Activo" : "Inactivo"}</Label>
                    </div>
                </div>
            </div>
            
            {/* Obras asignadas (Display only for now) */}
            {form.getValues("obrasAsignadas") && form.getValues("obrasAsignadas").length > 0 && (
                <div>
                    <Label className="font-semibold">Obras Asignadas (Informativo)</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                        {form.getValues("obrasAsignadas").join(', ')}
                        {/* In a real app, this would be a multi-select or link to manage assignments */}
                    </p>
                </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Guardar Usuario</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
