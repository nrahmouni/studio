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
import type { Empresa } from '@/lib/types';
import { EmpresaSchema } from '@/lib/types';
import { Loader2, Building } from 'lucide-react';
import Image from 'next/image';

// Schema for the form, making logoURL optional for update
const UpdateEmpresaSchema = EmpresaSchema.partial().omit({ id: true });
type UpdateEmpresaFormData = z.infer<typeof UpdateEmpresaSchema>;

export default function CompanyProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const form = useForm<UpdateEmpresaFormData>({
    resolver: zodResolver(UpdateEmpresaSchema),
    defaultValues: {
      nombre: '',
      CIF: '',
      emailContacto: '',
      telefono: '',
      logoURL: '',
    },
  });

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (storedEmpresaId) {
      setEmpresaId(storedEmpresaId);
      fetchProfile(storedEmpresaId);
    } else {
      toast({
        title: 'Error',
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
        form.reset({
          nombre: profile.nombre,
          CIF: profile.CIF,
          emailContacto: profile.emailContacto,
          telefono: profile.telefono,
          logoURL: profile.logoURL || '',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el perfil de la empresa.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al cargar el perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UpdateEmpresaFormData) => {
    if (!empresaId) return;
    setIsSaving(true);
    try {
      const result = await updateEmpresaProfile(empresaId, data);
      if (result.success && result.empresa) {
        setEmpresa(result.empresa);
        form.reset(result.empresa); // Reset form with potentially updated data
        toast({
          title: 'Perfil Actualizado',
          description: 'La información de tu empresa ha sido guardada.',
        });
      } else {
        toast({
          title: 'Error al Guardar',
          description: result.message || 'No se pudo actualizar el perfil.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Inesperado',
        description: 'Ocurrió un error al guardar los cambios.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Cargando perfil de empresa...</p>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Building className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">No se encontró el perfil de la empresa.</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">Volver al Panel</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
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
              <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center">
                <Building className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">{empresa.nombre}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Gestiona la información de tu empresa.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="nombre" className="font-semibold">Nombre de la Empresa</Label>
              <Controller
                name="nombre"
                control={form.control}
                render={({ field }) => <Input id="nombre" {...field} className="mt-1" />}
              />
              {form.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="CIF" className="font-semibold">CIF</Label>
              <Controller
                name="CIF"
                control={form.control}
                render={({ field }) => <Input id="CIF" {...field} className="mt-1" />}
              />
              {form.formState.errors.CIF && <p className="text-sm text-destructive mt-1">{form.formState.errors.CIF.message}</p>}
            </div>

            <div>
              <Label htmlFor="emailContacto" className="font-semibold">Email de Contacto</Label>
              <Controller
                name="emailContacto"
                control={form.control}
                render={({ field }) => <Input id="emailContacto" type="email" {...field} className="mt-1" />}
              />
              {form.formState.errors.emailContacto && <p className="text-sm text-destructive mt-1">{form.formState.errors.emailContacto.message}</p>}
            </div>

            <div>
              <Label htmlFor="telefono" className="font-semibold">Teléfono</Label>
              <Controller
                name="telefono"
                control={form.control}
                render={({ field }) => <Input id="telefono" {...field} className="mt-1" />}
              />
              {form.formState.errors.telefono && <p className="text-sm text-destructive mt-1">{form.formState.errors.telefono.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="logoURL" className="font-semibold">URL del Logo (opcional)</Label>
              <Controller
                name="logoURL"
                control={form.control}
                render={({ field }) => <Input id="logoURL" {...field} placeholder="https://ejemplo.com/logo.png" className="mt-1" />}
              />
              {form.formState.errors.logoURL && <p className="text-sm text-destructive mt-1">{form.formState.errors.logoURL.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
