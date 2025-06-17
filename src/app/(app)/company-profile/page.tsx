
// src/app/(app)/company-profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getEmpresaProfile, updateEmpresaProfile } from '@/lib/actions/company.actions';
import { registerTrabajador } from '@/lib/actions/user.actions';
import type { Empresa } from '@/lib/types';
import { EmpresaSchema, UsuarioFirebaseSchema } from '@/lib/types';
import { Loader2, Building, UserPlus, BadgeInfo } from 'lucide-react';
import Image from 'next/image';

const UpdateEmpresaSchema = EmpresaSchema.partial().omit({ id: true });
type UpdateEmpresaFormData = z.infer<typeof UpdateEmpresaSchema>;

const RegisterTrabajadorFormSchema = UsuarioFirebaseSchema.pick({
  nombre: true,
  email: true,
  dni: true,
  dniAnversoURL: true,
  dniReversoURL: true,
}).extend({
  dniAnversoURL: z.string().url("URL inválida para DNI anverso").optional().or(z.literal('')),
  dniReversoURL: z.string().url("URL inválida para DNI reverso").optional().or(z.literal('')),
});
type RegisterTrabajadorFormData = z.infer<typeof RegisterTrabajadorFormSchema>;

export default function CompanyProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);
  const [isRegisteringTrabajador, setIsRegisteringTrabajador] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const empresaForm = useForm<UpdateEmpresaFormData>({
    resolver: zodResolver(UpdateEmpresaSchema),
    defaultValues: {
      nombre: '',
      CIF: '',
      emailContacto: '',
      telefono: '',
      logoURL: '',
    },
  });

  const trabajadorForm = useForm<RegisterTrabajadorFormData>({
    resolver: zodResolver(RegisterTrabajadorFormSchema),
    defaultValues: {
      nombre: '',
      email: '',
      dni: '',
      dniAnversoURL: '',
      dniReversoURL: '',
    },
  });

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (storedEmpresaId) {
      setEmpresaId(storedEmpresaId);
      fetchProfile(storedEmpresaId);
    } else {
      toast({
        title: 'Error de Autenticación',
        description: 'No se pudo identificar la empresa. Por favor, inicia sesión de nuevo.',
        variant: 'destructive',
      });
      router.push('/auth/login/empresa');
    }
  }, [router, toast]);

  const fetchProfile = async (id: string) => {
    setIsLoading(true);
    try {
      const profile = await getEmpresaProfile(id);
      if (profile) {
        setEmpresa(profile);
        empresaForm.reset({
          nombre: profile.nombre,
          CIF: profile.CIF,
          emailContacto: profile.emailContacto,
          telefono: profile.telefono,
          logoURL: profile.logoURL || '',
        });
      } else {
        toast({
          title: 'Error de Carga',
          description: 'No se pudo cargar el perfil de la empresa.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al cargar el perfil de la empresa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onEmpresaSubmit = async (data: UpdateEmpresaFormData) => {
    if (!empresaId) return;
    setIsSavingEmpresa(true);
    try {
      const dataToSubmit = {
        ...data,
        logoURL: data.logoURL === '' ? null : data.logoURL,
      };
      const result = await updateEmpresaProfile(empresaId, dataToSubmit);
      if (result.success && result.empresa) {
        setEmpresa(result.empresa);
        empresaForm.reset({
            ...result.empresa,
            logoURL: result.empresa.logoURL || '',
        });
        toast({
          title: 'Éxito',
          description: 'Los datos de la empresa se han actualizado correctamente.',
        });
      } else {
        toast({
          title: 'Error al Guardar',
          description: result.message || 'No se pudo actualizar el perfil de la empresa.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al guardar los cambios del perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingEmpresa(false);
    }
  };

  const onTrabajadorSubmit = async (data: RegisterTrabajadorFormData) => {
    if (!empresaId) {
      toast({ title: 'Error de Sistema', description: 'ID de empresa no disponible para el registro.', variant: 'destructive' });
      return;
    }
    setIsRegisteringTrabajador(true);
    try {
      const dataToSend = {
        ...data,
        dniAnversoURL: data.dniAnversoURL === '' ? null : data.dniAnversoURL,
        dniReversoURL: data.dniReversoURL === '' ? null : data.dniReversoURL,
      };
      const result = await registerTrabajador(empresaId, dataToSend);
      if (result.success && result.usuario) {
        toast({
          title: 'Trabajador Registrado',
          description: `El trabajador ${result.usuario.nombre} ha sido añadido a tu empresa con éxito.`,
        });
        trabajadorForm.reset();
        // Optionally, re-fetch users list if displayed on this page or trigger a global state update
      } else {
        toast({
          title: 'Error al Registrar Trabajador',
          description: result.message || 'No se pudo registrar al trabajador. Revisa los datos e inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al registrar al trabajador.',
        variant: 'destructive',
      });
    } finally {
      setIsRegisteringTrabajador(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Cargando perfil de empresa...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] animate-fade-in-up">
        <Building className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">No se encontró el perfil de la empresa.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Volver al Panel</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card className="max-w-3xl mx-auto shadow-lg animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-4">
            {empresa.logoURL ? (
              <Image
                src={empresa.logoURL}
                alt={`Logo de ${empresa.nombre}`}
                width={80}
                height={80}
                className="rounded-md border border-border object-cover"
                data-ai-hint={empresa.dataAIHint || "company logo"}
              />
            ) : (
              <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center border">
                <Building className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">{empresa.nombre}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Gestiona la información de tu empresa y registra nuevos trabajadores.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={empresaForm.handleSubmit(onEmpresaSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="nombre" className="font-semibold">Nombre de la Empresa</Label>
              <Controller
                name="nombre"
                control={empresaForm.control}
                render={({ field }) => <Input id="nombre" {...field} className="mt-1" placeholder="Ej: Construcciones Modernas S.L." />}
              />
              {empresaForm.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{empresaForm.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="CIF" className="font-semibold">CIF</Label>
              <Controller
                name="CIF"
                control={empresaForm.control}
                render={({ field }) => <Input id="CIF" {...field} className="mt-1" placeholder="Ej: B12345678" />}
              />
              {empresaForm.formState.errors.CIF && <p className="text-sm text-destructive mt-1">{empresaForm.formState.errors.CIF.message}</p>}
            </div>

            <div>
              <Label htmlFor="emailContacto" className="font-semibold">Email de Contacto</Label>
              <Controller
                name="emailContacto"
                control={empresaForm.control}
                render={({ field }) => <Input id="emailContacto" type="email" {...field} className="mt-1" placeholder="Ej: contacto@empresa.com" />}
              />
              {empresaForm.formState.errors.emailContacto && <p className="text-sm text-destructive mt-1">{empresaForm.formState.errors.emailContacto.message}</p>}
            </div>

            <div>
              <Label htmlFor="telefono" className="font-semibold">Teléfono</Label>
              <Controller
                name="telefono"
                control={empresaForm.control}
                render={({ field }) => <Input id="telefono" {...field} className="mt-1" placeholder="Ej: 912345678" />}
              />
              {empresaForm.formState.errors.telefono && <p className="text-sm text-destructive mt-1">{empresaForm.formState.errors.telefono.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="logoURL" className="font-semibold">URL del Logo (opcional)</Label>
              <Controller
                name="logoURL"
                control={empresaForm.control}
                render={({ field }) => <Input id="logoURL" {...field} value={field.value ?? ''} placeholder="https://ejemplo.com/logo.png" className="mt-1" />}
              />
              {empresaForm.formState.errors.logoURL && <p className="text-sm text-destructive mt-1">{empresaForm.formState.errors.logoURL.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSavingEmpresa}>
              {isSavingEmpresa ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Datos de Empresa'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-3xl mx-auto shadow-lg animate-fade-in-up animation-delay-200">
        <CardHeader className="bg-accent/5 p-6">
           <div className="flex items-center space-x-3">
            <UserPlus className="h-8 w-8 text-accent" />
            <div>
                <CardTitle className="text-2xl font-bold font-headline text-accent">Registrar Nuevo Trabajador</CardTitle>
                <CardDescription className="text-md text-muted-foreground">Añade un nuevo miembro a tu equipo.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={trabajadorForm.handleSubmit(onTrabajadorSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="trabajadorNombre" className="font-semibold">Nombre Completo del Trabajador</Label>
              <Controller
                name="nombre"
                control={trabajadorForm.control}
                render={({ field }) => <Input id="trabajadorNombre" {...field} className="mt-1" placeholder="Ej: Juan Pérez García" />}
              />
              {trabajadorForm.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{trabajadorForm.formState.errors.nombre.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="trabajadorEmail" className="font-semibold">Email del Trabajador (para acceso)</Label>
              <Controller
                name="email"
                control={trabajadorForm.control}
                render={({ field }) => <Input id="trabajadorEmail" type="email" {...field} className="mt-1" placeholder="Ej: trabajador@email.com" />}
              />
              {trabajadorForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{trabajadorForm.formState.errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="trabajadorDni" className="font-semibold">DNI/NIE del Trabajador</Label>
              <Controller
                name="dni"
                control={trabajadorForm.control}
                render={({ field }) => <Input id="trabajadorDni" {...field} className="mt-1" placeholder="Ej: 12345678A o X1234567B" />}
              />
              {trabajadorForm.formState.errors.dni && <p className="text-sm text-destructive mt-1">{trabajadorForm.formState.errors.dni.message}</p>}
            </div>
            
            <div className="p-3 bg-primary/5 rounded-md border border-primary/20 text-sm text-primary/80 flex items-start">
                <BadgeInfo className="mr-2 h-5 w-5 shrink-0 mt-0.5 text-primary" />
                <span>La contraseña inicial del trabajador será su DNI/NIE. Podrá cambiarla después de su primer inicio de sesión.</span>
            </div>


            <div>
              <Label htmlFor="dniAnversoURL" className="font-semibold">URL Foto Anverso DNI (opcional)</Label>
               <Controller
                name="dniAnversoURL"
                control={trabajadorForm.control}
                render={({ field }) => <Input id="dniAnversoURL" {...field} value={field.value ?? ''} className="mt-1" placeholder="https://ejemplo.com/dni_anverso.jpg" />}
              />
              {trabajadorForm.formState.errors.dniAnversoURL && <p className="text-sm text-destructive mt-1">{trabajadorForm.formState.errors.dniAnversoURL.message}</p>}
            </div>

            <div>
              <Label htmlFor="dniReversoURL" className="font-semibold">URL Foto Reverso DNI (opcional)</Label>
              <Controller
                name="dniReversoURL"
                control={trabajadorForm.control}
                render={({ field }) => <Input id="dniReversoURL" {...field} value={field.value ?? ''} className="mt-1" placeholder="https://ejemplo.com/dni_reverso.jpg" />}
              />
              {trabajadorForm.formState.errors.dniReversoURL && <p className="text-sm text-destructive mt-1">{trabajadorForm.formState.errors.dniReversoURL.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isRegisteringTrabajador}>
              {isRegisteringTrabajador ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Registrar Trabajador
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
