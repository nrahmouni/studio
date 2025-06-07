// src/app/(app)/obras/new/page.tsx
'use client'; // Marcado como Client Component para usar hooks como useForm

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Asumiendo que Textarea existe o será creada
import { Calendar } from "@/components/ui/calendar"; // Asumiendo Calendar de ShadCN
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, Briefcase } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// import { createObra } from '@/lib/actions/obra.actions'; // Acción a implementar
import { useState, useEffect } from 'react';

// Esquema de validación (simplificado)
const ObraFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  direccion: z.string().min(5, 'La dirección es requerida.'),
  clienteNombre: z.string().min(2, 'El nombre del cliente es requerido.'),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida." }),
  // Otros campos como fechaFin, jefeObraId se pueden añadir
});

type ObraFormData = z.infer<typeof ObraFormSchema>;

export default function NuevaObraPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const form = useForm<ObraFormData>({
    resolver: zodResolver(ObraFormSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      clienteNombre: '',
      fechaInicio: new Date(),
    },
  });

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (storedEmpresaId) {
      setEmpresaId(storedEmpresaId);
    } else {
      toast({
        title: "Error de autenticación",
        description: "No se pudo identificar la empresa. Serás redirigido.",
        variant: "destructive",
      });
      router.push('/auth/login/empresa');
    }
  }, [router, toast]);

  const onSubmit = async (data: ObraFormData) => {
    if (!empresaId) {
       toast({ title: 'Error', description: 'ID de empresa no encontrado.', variant: 'destructive' });
       return;
    }
    setIsSubmitting(true);
    // Simulación de creación de obra
    console.log("Datos de la nueva obra:", { ...data, empresaId });
    // const result = await createObra({ ...data, empresaId });
    // if (result.success) {
    //   toast({ title: 'Éxito', description: 'Nueva obra creada correctamente.' });
    //   router.push('/obras');
    // } else {
    //   toast({ title: 'Error', description: result.message || 'No se pudo crear la obra.', variant: 'destructive' });
    // }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular llamada a API
    toast({
      title: 'Simulación Exitosa',
      description: `Obra "${data.nombre}" sería creada para la empresa ${empresaId}.`,
    });
    router.push('/obras'); // Redirigir a la lista de obras después de la simulación
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-primary/5 p-6">
           <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Crear Nueva Obra</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Completa los detalles de tu nuevo proyecto.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="nombre" className="font-semibold">Nombre de la Obra</Label>
              <Input id="nombre" {...form.register('nombre')} className="mt-1" />
              {form.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="direccion" className="font-semibold">Dirección</Label>
              <Textarea id="direccion" {...form.register('direccion')} className="mt-1" placeholder="Calle, Número, Ciudad, Código Postal"/>
              {form.formState.errors.direccion && <p className="text-sm text-destructive mt-1">{form.formState.errors.direccion.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="clienteNombre" className="font-semibold">Nombre del Cliente</Label>
              <Input id="clienteNombre" {...form.register('clienteNombre')} className="mt-1" />
              {form.formState.errors.clienteNombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.clienteNombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="fechaInicio" className="font-semibold block mb-1">Fecha de Inicio</Label>
              <Controller
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.fechaInicio && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaInicio.message}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Crear Obra'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
