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
import { authenticateTrabajadorByCode } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  accessCode: z.string().min(6, {
    message: 'El código de acceso debe tener al menos 6 caracteres.',
  }),
});

export function TrabajadorLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accessCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await authenticateTrabajadorByCode(values.accessCode);
      if (result.success && result.trabajadorId && result.subcontrataId) {
        toast({
          title: 'Acceso Correcto',
          description: `Bienvenido, ${result.nombre}.`,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('trabajadorId_obra_link', result.trabajadorId);
          localStorage.setItem('subcontrataId_obra_link', result.subcontrataId);
          localStorage.setItem('userRole_obra_link', 'trabajador');
        }
        router.push('/dashboard'); 
      } else {
        toast({
          title: 'Error de Acceso',
          description: result.message || 'Código de acceso incorrecto.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error Inesperado',
        description: error.message || 'Ha ocurrido un error. Por favor, inténtalo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Acceso Trabajador</CardTitle>
        <CardDescription>
          Introduce tu código de acceso único para registrar tus horas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="accessCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Acceso</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu código personal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
