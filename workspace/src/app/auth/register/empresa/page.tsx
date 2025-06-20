
// src/app/auth/register/empresa/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createEmpresaWithAdmin } from '@/lib/actions/company.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, ArrowLeft, Building } from 'lucide-react';
import Link from 'next/link';

const RegisterEmpresaFormSchema = z.object({
  empresaNombre: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres." }),
  adminEmail: z.string().email({ message: "Tu email de administrador es inválido." }),
  adminPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type RegisterEmpresaFormData = z.infer<typeof RegisterEmpresaFormSchema>;

export default function EmpresaRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterEmpresaFormData>({
    resolver: zodResolver(RegisterEmpresaFormSchema),
    defaultValues: {
      empresaNombre: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  async function onSubmit(values: RegisterEmpresaFormData) {
    setIsLoading(true);
    try {
      const result = await createEmpresaWithAdmin(values);
      if (result.success && result.empresa && result.adminUser) {
        toast({
          title: 'Empresa Registrada con Éxito',
          description: `La empresa ${result.empresa.nombre} ha sido creada. Ya puedes iniciar sesión como administrador. Completa el perfil de tu empresa desde el panel.`,
        });
        router.push('/auth/login/empresa');
      } else {
        toast({
          title: 'Error en el Registro',
          description: result.message || 'No se pudo completar el registro. Verifica los datos.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      let displayMessage = 'Ha ocurrido un error durante el registro. Inténtalo más tarde.';
      if (error.message === "An unexpected response was received from the server.") {
        displayMessage = "El servidor no respondió a tiempo. Verifica tu conexión o inténtalo más tarde. Esto podría ser un problema temporal del servidor (Error 504).";
      } else if (error.message) {
        displayMessage = error.message;
      }
      toast({
        title: 'Error Inesperado',
        description: displayMessage,
        variant: 'destructive',
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-primary/10">
      <div className="absolute top-4 left-4">
        <Link href="/auth/select-role" passHref>
          <Button variant="ghost" className="text-primary hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </Link>
      </div>
      <div className="mb-6 text-center">
        <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-primary/80 transition-colors">
          ObraLink
        </Link>
        <p className="text-muted-foreground mt-1">Registro Rápido para Nuevas Empresas</p>
      </div>
      <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center"><Building className="mr-3 text-primary"/>Crea tu Empresa en ObraLink</CardTitle>
          <CardDescription>
            Solo necesitas el nombre de tu empresa, tu email y una contraseña para empezar. Podrás añadir más detalles después.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="empresaNombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl><Input placeholder="Ej: Construcciones Innovadoras S.L." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu Email (será tu usuario administrador)</FormLabel>
                    <FormControl><Input type="email" placeholder="tu.email@dominio.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña para el Administrador</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormDescription>Mínimo 6 caracteres.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Registrar Empresa'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta de empresa? <Link href="/auth/login/empresa" className="font-medium text-primary hover:underline">Inicia sesión aquí</Link>.
      </p>
    </div>
  );
}
