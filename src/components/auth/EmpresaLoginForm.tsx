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
import { authenticateUserByPassword } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Usuario } from '@/lib/types';

const formSchema = z.object({
  email: z.string().email({
    message: 'Por favor, introduce un email válido.',
  }),
  password: z.string().min(1, {
    message: 'La contraseña no puede estar vacía.',
  }),
});

export function PasswordLoginForm() {
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
      const result = await authenticateUserByPassword(values);
      if (result.success && result.userId && result.role) {
        toast({
          title: 'Inicio de Sesión Exitoso',
          description: `Bienvenido de nuevo.`,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('userId_obra_link', result.userId);
          localStorage.setItem('userRole_obra_link', result.role);
          if (result.constructoraId) localStorage.setItem('constructoraId_obra_link', result.constructoraId);
          if (result.subcontrataId) localStorage.setItem('subcontrataId_obra_link', result.subcontrataId);
        }
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error de Inicio de Sesión',
          description: result.message || 'Credenciales incorrectas o rol no autorizado.',
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
        <CardTitle className="text-2xl font-headline">Acceso para Empresas</CardTitle>
        <CardDescription>
          Introduce tus credenciales de Encargado, Subcontrata o Constructora.
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
                    <Input placeholder="tu@email.com" {...field} />
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Iniciar Sesión'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
