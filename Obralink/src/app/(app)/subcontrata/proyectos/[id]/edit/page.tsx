
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import { getProyectoById, getConstructoras, updateProyecto } from '@/lib/actions/app.actions';
import type { Proyecto, Constructora } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const EditProyectoFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  clienteNombre: z.string().min(1, "El nombre del cliente final es requerido").optional(),
  constructoraId: z.string({ required_error: "Debes asignar una constructora cliente." }),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida." }).nullable(),
  fechaFin: z.date().optional().nullable(),
});
type EditProyectoFormData = z.infer<typeof EditProyectoFormSchema>;

export default function EditSubcontrataProyectoPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [constructoras, setConstructoras] = useState<Constructora[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditProyectoFormData>({
    resolver: zodResolver(EditProyectoFormSchema),
  });
  
  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [proyectoData, constructorasData] = await Promise.all([
            getProyectoById(projectId),
            getConstructoras(),
        ]);
        
        if (!proyectoData) {
          toast({ title: "Error", description: "Proyecto no encontrado.", variant: "destructive" });
          router.push('/subcontrata/proyectos');
          return;
        }

        form.reset({
            ...proyectoData,
            fechaInicio: proyectoData.fechaInicio ? parseISO(proyectoData.fechaInicio) : null,
            fechaFin: proyectoData.fechaFin ? parseISO(proyectoData.fechaFin) : null,
        });
        setConstructoras(constructorasData);

      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los datos para editar.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, router, toast, form]);
  
  const handleSubmit = async (data: EditProyectoFormData) => {
    setIsSubmitting(true);
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
     if (!subcontrataId) {
        toast({ title: "Error", description: "No se pudo identificar tu empresa subcontrata.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    const result = await updateProyecto(projectId, { 
        ...data, 
        subcontrataId,
        fechaInicio: data.fechaInicio ? data.fechaInicio.toISOString() : null,
        fechaFin: data.fechaFin ? data.fechaFin.toISOString() : null,
    });
    if(result.success) {
        toast({ title: "Éxito", description: "Proyecto actualizado correctamente."});
        router.push(`/subcontrata/proyectos/${projectId}`);
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive"});
    }
    setIsSubmitting(false);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
            <h1 className="text-3xl font-bold font-headline text-primary">Modificar Proyecto</h1>
            <p className="text-muted-foreground mt-1">Realiza cambios en los detalles del proyecto.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Formulario de Edición</CardTitle>
                <CardDescription>Ajusta la información necesaria y guarda los cambios.</CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6 py-4">
                    <div>
                        <Label htmlFor="nombre">Nombre del Proyecto</Label>
                        <Input id="nombre" {...form.register('nombre')} className="mt-1" />
                        {form.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.nombre.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input id="direccion" {...form.register('direccion')} className="mt-1" />
                        {form.formState.errors.direccion && <p className="text-sm text-destructive mt-1">{form.formState.errors.direccion.message}</p>}
                    </div>
                    
                    <div>
                        <Label htmlFor="constructoraId">Cliente (Constructora)</Label>
                        <Controller
                            name="constructoraId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Selecciona una constructora" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {constructoras.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.constructoraId && <p className="text-sm text-destructive mt-1">{form.formState.errors.constructoraId.message}</p>}
                    </div>
                    
                    <div>
                        <Label htmlFor="clienteNombre">Nombre del Cliente Final</Label>
                        <Input id="clienteNombre" {...form.register('clienteNombre')} className="mt-1" />
                        {form.formState.errors.clienteNombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.clienteNombre.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                            <Controller name="fechaInicio" control={form.control} render={({ field }) => (
                                <Popover><PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", {locale: es}) : <span>Selecciona fecha</span>}
                                </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/></PopoverContent></Popover>
                            )}/>
                            {form.formState.errors.fechaInicio && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaInicio.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="fechaFin">Fecha de Fin (Opcional)</Label>
                            <Controller name="fechaFin" control={form.control} render={({ field }) => (
                                <Popover><PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", {locale: es}) : <span>Selecciona fecha</span>}
                                </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/></PopoverContent></Popover>
                            )}/>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                         <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
