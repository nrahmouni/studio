
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
import { Card, CardContent, CardDescription as CardUiDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, ArrowLeft, Building, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { addEmpresa } from '@/lib/actions/app.actions';

const RegisterEmpresaFormSchema = z.object({
  empresaNombre: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres." }),
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
    },
  });

  async function onSubmit(values: RegisterEmpresaFormData) {
    setIsLoading(true);
    const result = await addEmpresa({ empresaNombre: values.empresaNombre });
    
    if (result.success && result.empresa) {
        toast({
            title: 'Empresa Registrada con Éxito',
            description: `La empresa ${result.empresa.nombre} ha sido creada.`,
        });
        router.push('/');
    } else {
         toast({
          title: 'Error en el Registro',
          description: result.message || 'No se pudo completar el registro.',
          variant: 'destructive',
        });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-primary/10">
      <div className="absolute top-4 left-4">
        <Link href="/" passHref>
          <Button variant="ghost" className="text-primary hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
          </Button>
        </Link>
      </div>
      <div className="mb-6 text-center">
        <Link href="/" className="flex items-center justify-center gap-2 text-3xl font-bold font-headline text-primary hover:text-primary/80 transition-colors">
          <Briefcase className="h-8 w-8"/> ObraLink
        </Link>
        <p className="text-muted-foreground mt-1">Registro Rápido para Nuevas Empresas</p>
      </div>
      <Card className="w-full max-w-md shadow-xl animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center"><Building className="mr-3 text-primary"/>Crea tu Empresa en ObraLink</CardTitle>
          <CardUiDescription>
            Solo necesitas el nombre de tu empresa para empezar.
          </CardUiDescription>
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
              
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Registrar Empresa'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Esta es una versión de demostración. No se requiere inicio de sesión.
      </p>
    </div>
  );
}
