
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
import { authenticateTrabajador } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { UsuarioFirebase } from '@/lib/types';


const formSchema = z.object({
  email: z.string().email({
    message: 'Por favor, introduce un email válido.',
  }),
  password: z.string().min(1, {
    message: 'La contraseña no puede estar vacía.',
  }),
});

export function TrabajadorLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await authenticateTrabajador(values);
      if (result.success && result.usuarioId && result.empresaId && result.role) {
        toast({
          title: 'Inicio de Sesión Exitoso',
          description: 'Bienvenido.',
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('usuarioId_obra_link', result.usuarioId);
          localStorage.setItem('empresaId_obra_link', result.empresaId);
          localStorage.setItem('userRole_obra_link', result.role as UsuarioFirebase['rol']); // Store the specific role
        }
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error de Inicio de Sesión',
          description: result.message || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Inesperado',
        description: 'Ha ocurrido un error. Por favor, inténtalo más tarde.',
        variant: 'destructive',
      });
       console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Acceso Trabajador</CardTitle>
        <CardDescription>
          Introduce tu email y contraseña para acceder a tus tareas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu.email@trabajo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
