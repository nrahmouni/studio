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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, ArrowLeft, Building, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { registerNewCompany } from '@/lib/actions/auth.actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RegisterFormSchema = z.object({
  companyName: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres." }),
  companyType: z.enum(['constructora', 'subcontrata'], { required_error: "Debes seleccionar un tipo de empresa."}),
  adminEmail: z.string().email({ message: "Tu email de administrador es inválido." }),
  adminPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type RegisterFormData = z.infer<typeof RegisterFormSchema>;

export default function EmpresaRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      companyName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  async function onSubmit(values: RegisterFormData) {
    setIsLoading(true);
    try {
      const result = await registerNewCompany(values);
      if (result.success) {
        toast({
          title: 'Empresa Registrada con Éxito',
          description: `La empresa ${values.companyName} ha sido creada. Ya puedes iniciar sesión como administrador.`,
        });
        router.push('/auth/login');
      } else {
        toast({
          title: 'Error en el Registro',
          description: result.message || 'No se pudo completar el registro. Verifica los datos.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error Inesperado',
        description: error.message || 'Ha ocurrido un error durante el registro. Inténtalo más tarde.',
        variant: 'destructive',
      });
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
        <p className="text-muted-foreground mt-1">Registro para Nuevas Empresas</p>
      </div>
      <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center"><UserPlus className="mr-3 text-primary"/>Alta en ObraLink</CardTitle>
          <CardDescription>
            Registra tu Constructora o Subcontrata para empezar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Empresa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona si eres Constructora o Subcontrata" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="constructora">Constructora (Cliente Principal)</SelectItem>
                        <SelectItem value="subcontrata">Subcontrata (Proveedor de servicios)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de tu Empresa</FormLabel>
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
        ¿Ya tienes una cuenta? <Link href="/auth/login" className="font-medium text-primary hover:underline">Inicia sesión aquí</Link>.
      </p>
    </div>
  );
}
