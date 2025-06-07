
// src/app/(app)/obras/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, Briefcase, ArrowLeft, Save, AlertTriangle, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getObraById, updateObra } from '@/lib/actions/obra.actions';
import { getUsuarioById } from '@/lib/actions/user.actions';
import { ObraSchema, CostoCategoriaSchema, type Obra, type UsuarioFirebase } from '@/lib/types';

const ObraEditFormSchema = ObraSchema.omit({ 
  id: true, 
  empresaId: true, 
  dataAIHint: true, 
}).extend({
  // costosPorCategoria is already optional in ObraSchema, but defined via CostoCategoriaSchema
});
type ObraEditFormData = z.infer<typeof ObraEditFormSchema>;

export default function EditObraPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const obraId = params.id as string;

  const [obraData, setObraData] = useState<Obra | null>(null);
  const [currentUser, setCurrentUser] = useState<UsuarioFirebase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const form = useForm<ObraEditFormData>({
    resolver: zodResolver(ObraEditFormSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      clienteNombre: '',
      fechaInicio: new Date(),
      fechaFin: undefined,
      descripcion: '', 
      jefeObraId: undefined,
      costosPorCategoria: [],
    },
  });

  const { fields: costoFields, append: appendCosto, remove: removeCosto } = useFieldArray({
    control: form.control,
    name: "costosPorCategoria",
  });

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');

    if (storedEmpresaId) setEmpresaId(storedEmpresaId);
    else {
      toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
      router.push('/auth/login/empresa'); 
      return;
    }

    if (storedUsuarioId) {
        getUsuarioById(storedUsuarioId).then(setCurrentUser).catch(console.error);
    }

    const fetchObra = async () => {
      if (!obraId || !storedEmpresaId) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedObra = await getObraById(obraId, storedEmpresaId);
        if (fetchedObra) {
          setObraData(fetchedObra);
          form.reset({
            nombre: fetchedObra.nombre,
            direccion: fetchedObra.direccion,
            clienteNombre: fetchedObra.clienteNombre,
            fechaInicio: new Date(fetchedObra.fechaInicio),
            fechaFin: fetchedObra.fechaFin ? new Date(fetchedObra.fechaFin) : undefined,
            descripcion: fetchedObra.descripcion || '', 
            jefeObraId: fetchedObra.jefeObraId || undefined,
            costosPorCategoria: fetchedObra.costosPorCategoria || [],
          });
        } else {
          setError("Obra no encontrada o no tienes acceso.");
          toast({ title: "Error", description: "Obra no encontrada.", variant: "destructive" });
        }
      } catch (err) {
        setError("Error al cargar la obra.");
        toast({ title: "Error de Carga", description: "No se pudo cargar la obra.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchObra();
  }, [obraId, form, router, toast]);

  const onSubmit = async (data: ObraEditFormData) => {
    if (!obraId || !empresaId) return;
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...data,
        fechaFin: data.fechaFin === undefined ? null : data.fechaFin,
        costosPorCategoria: data.costosPorCategoria?.map(c => ({...c, costo: Number(c.costo)})) || [],
      };
      const result = await updateObra(obraId, empresaId, dataToSubmit);
      if (result.success && result.obra) {
        toast({ title: 'Éxito', description: `Obra "${result.obra.nombre}" actualizada.` });
        router.push(`/obras/${obraId}`);
      } else {
        toast({ title: 'Error al Guardar', description: result.message || 'No se pudo actualizar la obra.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error Inesperado', description: 'Ocurrió un error al guardar.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEditCosts = currentUser && obraData && (currentUser.rol === 'admin' || currentUser.id === obraData.jefeObraId);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">Cargando obra...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-destructive/10 border-destructive text-destructive animate-fade-in-up"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent>
        <CardFooter><Button variant="outline" onClick={() => router.push('/obras')} className="border-destructive text-destructive hover:bg-destructive/20"><ArrowLeft className="mr-2 h-4 w-4"/>Volver</Button></CardFooter></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" onClick={() => router.push(`/obras/${obraId}`)} className="mb-6 animate-fade-in-down">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Detalles de Obra
      </Button>
      <Card className="max-w-3xl mx-auto shadow-lg animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Editar Obra</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Modifica los detalles del proyecto y gestiona sus costos.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos existentes de la obra */}
            <div>
              <Label htmlFor="nombre" className="font-semibold">Nombre de la Obra</Label>
              <Input id="nombre" {...form.register('nombre')} className="mt-1" />
              {form.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="direccion" className="font-semibold">Dirección</Label>
              <Textarea id="direccion" {...form.register('direccion')} className="mt-1" />
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
                <Controller control={form.control} name="fechaInicio"
                  render={({ field }) => (
                    <Popover><PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                        </Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                            mode="single" 
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            initialFocus 
                            locale={es}
                        />
                      </PopoverContent>
                    </Popover>)}/>
                {form.formState.errors.fechaInicio && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaInicio.message}</p>}
              </div>
              <div>
                <Label htmlFor="fechaFin" className="font-semibold block mb-1">Fecha Fin (Opcional)</Label>
                <Controller control={form.control} name="fechaFin"
                  render={({ field }) => (
                    <Popover><PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                           {field.value && (typeof field.value === 'string' || field.value instanceof Date) ? format(new Date(field.value), "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                        </Button></PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                            mode="single" 
                            selected={field.value && (typeof field.value === 'string' || field.value instanceof Date) ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date || null)} 
                            initialFocus 
                            locale={es} 
                        />
                      </PopoverContent>
                    </Popover>)}/>
                {form.formState.errors.fechaFin && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaFin.message}</p>}
              </div>
            </div>
            
            <div>
                <Label htmlFor="jefeObraId" className="font-semibold">ID Jefe de Obra (Opcional)</Label>
                <Input id="jefeObraId" {...form.register('jefeObraId')} className="mt-1" placeholder="ID del usuario jefe de obra" />
                {form.formState.errors.jefeObraId && <p className="text-sm text-destructive mt-1">{form.formState.errors.jefeObraId.message}</p>}
            </div>

            <div>
              <Label htmlFor="descripcion" className="font-semibold">Descripción Adicional (Opcional)</Label>
              <Textarea id="descripcion" {...form.register('descripcion')} className="mt-1" placeholder="Notas, especificaciones adicionales..." rows={3}/>
              {form.formState.errors.descripcion && <p className="text-sm text-destructive mt-1">{form.formState.errors.descripcion.message}</p>}
            </div>
            
            {/* Sección de Costos por Categoría */}
            {canEditCosts && (
            <Card className="border-dashed border-accent/50">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-accent flex items-center">
                    <DollarSign className="mr-2 h-6 w-6" /> Gestión de Costos por Categoría
                </CardTitle>
                <CardDescription>Añade o modifica los costos asociados a diferentes categorías de trabajo para esta obra.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {costoFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_150px_auto] gap-3 items-end p-3 border rounded-md bg-muted/20 relative">
                    <Input type="hidden" {...form.register(`costosPorCategoria.${index}.id`)} />
                    <div>
                      <Label htmlFor={`costosPorCategoria.${index}.categoria`} className="text-xs font-medium">Categoría</Label>
                      <Input 
                        id={`costosPorCategoria.${index}.categoria`}
                        {...form.register(`costosPorCategoria.${index}.categoria`)} 
                        placeholder="Ej: Electricidad"
                        className="mt-1"
                      />
                       {form.formState.errors.costosPorCategoria?.[index]?.categoria && <p className="text-sm text-destructive mt-1">{form.formState.errors.costosPorCategoria[index]?.categoria?.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor={`costosPorCategoria.${index}.costo`} className="text-xs font-medium">Costo (€)</Label>
                      <Input 
                        id={`costosPorCategoria.${index}.costo`}
                        type="number"
                        step="0.01"
                        {...form.register(`costosPorCategoria.${index}.costo`, { valueAsNumber: true })}
                        placeholder="0.00"
                        className="mt-1"
                      />
                       {form.formState.errors.costosPorCategoria?.[index]?.costo && <p className="text-sm text-destructive mt-1">{form.formState.errors.costosPorCategoria[index]?.costo?.message}</p>}
                    </div>
                     <div>
                      <Label htmlFor={`costosPorCategoria.${index}.notas`} className="text-xs font-medium">Notas</Label>
                      <Input 
                        id={`costosPorCategoria.${index}.notas`}
                        {...form.register(`costosPorCategoria.${index}.notas`)} 
                        placeholder="Opcional"
                        className="mt-1"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCosto(index)} className="text-destructive hover:bg-destructive/10 self-center mt-5" title="Eliminar costo">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCosto({ id: `new-${Date.now()}`, categoria: '', costo: 0, notas: '' })}
                  className="mt-2 border-accent text-accent hover:bg-accent/10"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Categoría de Costo
                </Button>
              </CardContent>
            </Card>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Guardar Cambios</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
