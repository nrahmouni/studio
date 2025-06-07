// src/app/(app)/obras/new/page.tsx
'use client'; 

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, Briefcase } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createObra } from '@/lib/actions/obra.actions'; 
import { useState, useEffect } from 'react';
import { ObraSchema } from '@/lib/types'; // Import full ObraSchema

// Schema for the form, omitting id (auto-generated) and empresaId (from context)
const ObraFormSchema = ObraSchema.omit({ id: true, empresaId: true, dataAIHint: true, jefeObraId: true, fechaFin: true })
  .extend({
    fechaFinEstimada: z.date().optional().nullable(), // For user input, can be optional
    jefeObraEmail: z.string().email("Email del jefe de obra inválido").optional().or(z.literal('')), // Optional field
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
      fechaFinEstimada: null,
      jefeObraEmail: '',
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
    
    // Prepare data for createObra, mapping fechaFinEstimada to fechaFin
    const obraToCreate = {
      ...data,
      empresaId: empresaId,
      fechaFin: data.fechaFinEstimada, // Use fechaFinEstimada as fechaFin for the backend
      // jefeObraId would be resolved from jefeObraEmail on the backend in a real scenario
    };
    // Remove fields not in the backend schema before sending
    const { fechaFinEstimada, jefeObraEmail, ...finalData } = obraToCreate;


    const result = await createObra(finalData);
    if (result.success && result.obra) {
      toast({ title: 'Éxito', description: `Nueva obra "${result.obra.nombre}" creada correctamente.` });
      router.push('/obras');
    } else {
      toast({ title: 'Error', description: result.message || 'No se pudo crear la obra.', variant: 'destructive' });
    }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {form.formState.errors.fechaInicio && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaInicio.message}</p>}
              </div>
               <div>
                <Label htmlFor="fechaFinEstimada" className="font-semibold block mb-1">Fecha Fin Estimada (Opcional)</Label>
                <Controller
                  control={form.control}
                  name="fechaFinEstimada"
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
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date || null)} // Ensure null is passed if date is undefined
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {form.formState.errors.fechaFinEstimada && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaFinEstimada.message}</p>}
              </div>
            </div>
             <div>
              <Label htmlFor="jefeObraEmail" className="font-semibold">Email Jefe de Obra (Opcional)</Label>
              <Input id="jefeObraEmail" type="email" {...form.register('jefeObraEmail')} className="mt-1" placeholder="jefe.obra@ejemplo.com" />
              {form.formState.errors.jefeObraEmail && <p className="text-sm text-destructive mt-1">{form.formState.errors.jefeObraEmail.message}</p>}
               <p className="text-xs text-muted-foreground mt-1">Si se proporciona, se intentará asignar al usuario correspondiente.</p>
            </div>


            <div className="flex justify-end space-x-3 pt-4">
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
