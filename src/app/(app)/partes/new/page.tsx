// src/app/(app)/partes/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, FileText, ArrowLeft, Send } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createParte } from '@/lib/actions/parte.actions';
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import type { Obra } from '@/lib/types';
import { useState, useEffect } from 'react';
import { ParteSchema } from '@/lib/types';

const ParteFormSchema = ParteSchema.omit({ 
  id: true, 
  validado: true, 
  validadoPor: true, 
  timestamp: true, 
  dataAIHint: true,
  usuarioId: true,
  fotosURLs: true, 
  firmaURL: true,
});

type ParteFormData = z.infer<typeof ParteFormSchema>;

export default function NuevoPartePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoadingObras, setIsLoadingObras] = useState(true);

  const form = useForm<ParteFormData>({
    resolver: zodResolver(ParteFormSchema),
    defaultValues: {
      obraId: '',
      fecha: new Date(),
      tareasRealizadas: '',
      incidencias: '',
      tareasSeleccionadas: [],
    },
  });

  useEffect(() => {
    const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    const userRole = localStorage.getItem('userRole_obra_link');

    if (storedUsuarioId) setUsuarioId(storedUsuarioId);
    if (storedEmpresaId) setEmpresaId(storedEmpresaId);
    
    if (!storedUsuarioId && userRole !== 'empresa') {
        toast({title: "Error", description: "Usuario no identificado.", variant: "destructive"});
        router.push('/auth/select-role');
        return;
    }
    if (!storedEmpresaId) {
        toast({title: "Error", description: "Empresa no identificada.", variant: "destructive"});
        router.push('/auth/select-role');
        return;
    }
    
    const fetchObras = async () => {
      if (storedEmpresaId) {
        setIsLoadingObras(true);
        try {
          const fetchedObras = await getObrasByEmpresaId(storedEmpresaId);
          setObras(fetchedObras.filter(o => !o.fechaFin || new Date(o.fechaFin) >= new Date())); 
        } catch (error) {
          toast({ title: 'Error', description: 'No se pudieron cargar las obras.', variant: 'destructive' });
        } finally {
          setIsLoadingObras(false);
        }
      }
    };
    fetchObras();

  }, [router, toast]);

  const onSubmit = async (data: ParteFormData) => {
    if (!usuarioId && localStorage.getItem('userRole_obra_link') !== 'empresa') {
      toast({ title: 'Error', description: 'ID de trabajador no encontrado.', variant: 'destructive' });
      return;
    }
    const finalUsuarioId = usuarioId || localStorage.getItem('usuarioId_obra_link') || 'admin_placeholder_id';


    if (!empresaId) {
      toast({ title: 'Error', description: 'ID de empresa no encontrado.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    
    const parteToCreate = {
      ...data,
      usuarioId: finalUsuarioId, 
    };

    const result = await createParte(parteToCreate);
    if (result.success && result.parte) {
      toast({ title: 'Éxito', description: 'Nuevo parte de trabajo registrado.' });
      router.push('/partes');
    } else {
      toast({ title: 'Error', description: result.message || 'No se pudo registrar el parte.', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" onClick={() => router.push('/partes')} className="mb-6 animate-fade-in-down">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado
      </Button>
      <Card className="max-w-2xl mx-auto shadow-lg animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Registrar Nuevo Parte de Trabajo</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Documenta las actividades del día.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="obraId" className="font-semibold">Obra</Label>
              <Controller
                name="obraId"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingObras}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder={isLoadingObras ? "Cargando obras..." : "Selecciona una obra"} />
                    </SelectTrigger>
                    <SelectContent>
                      {!isLoadingObras && obras.length === 0 && <SelectItem value="no-obras" disabled>No hay obras activas</SelectItem>}
                      {obras.map(obra => (
                        <SelectItem key={obra.id} value={obra.id}>{obra.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.obraId && <p className="text-sm text-destructive mt-1">{form.formState.errors.obraId.message}</p>}
            </div>

            <div>
              <Label htmlFor="fecha" className="font-semibold block mb-1">Fecha del Parte</Label>
               <Controller
                control={form.control}
                name="fecha"
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
                        {field.value ? format(new Date(field.value), "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.fecha && <p className="text-sm text-destructive mt-1">{form.formState.errors.fecha.message}</p>}
            </div>

            <div>
              <Label htmlFor="tareasRealizadas" className="font-semibold">Tareas Realizadas</Label>
              <Textarea
                id="tareasRealizadas"
                {...form.register('tareasRealizadas')}
                rows={5}
                className="mt-1"
                placeholder="Describe detalladamente los trabajos efectuados, materiales usados, etc."
              />
              {form.formState.errors.tareasRealizadas && <p className="text-sm text-destructive mt-1">{form.formState.errors.tareasRealizadas.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="incidencias" className="font-semibold">Incidencias (opcional)</Label>
              <Textarea
                id="incidencias"
                {...form.register('incidencias')}
                rows={3}
                className="mt-1"
                placeholder="Anota cualquier problema, retraso, o evento relevante."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || isLoadingObras}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Registrar Parte</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
