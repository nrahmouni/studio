
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import type { Proyecto, Constructora } from '@/lib/types';
import { addProyecto } from '@/lib/actions/app.actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AddProyectoDialogProps {
  onProyectoAdded: (newProyecto: Proyecto) => void;
  constructoras: Constructora[];
  children: React.ReactNode;
}

const AddProyectoFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  clienteNombre: z.string().min(1, "El nombre del cliente final es requerido"),
  constructoraId: z.string({ required_error: "Debes asignar una constructora cliente." }),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida." }).nullable(),
  fechaFin: z.date().optional().nullable(),
});

type AddProyectoFormData = z.infer<typeof AddProyectoFormSchema>;

export function AddProyectoSubcontrataDialog({ onProyectoAdded, constructoras, children }: AddProyectoDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<AddProyectoFormData>({
    resolver: zodResolver(AddProyectoFormSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      clienteNombre: '',
      fechaInicio: null,
      fechaFin: null,
    },
  });

  const handleSubmit = async (data: AddProyectoFormData) => {
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
        toast({ title: 'Error', description: 'No se pudo identificar tu empresa subcontrata.', variant: 'destructive' });
        return;
    }

    const result = await addProyecto({ 
      ...data,
      subcontrataId, 
    });
    if (result.success && result.proyecto) {
      toast({ title: 'Éxito', description: `Proyecto ${result.proyecto.nombre} añadido.` });
      onProyectoAdded(result.proyecto);
      form.reset();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Introduce los detalles del nuevo proyecto que gestionará tu empresa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <div>
              <Label htmlFor="nombre">Nombre del Proyecto</Label>
              <Input id="nombre" {...form.register('nombre')} className="mt-1" placeholder="Ej: Reforma Local Comercial" />
              {form.formState.errors.nombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.nombre.message}</p>}
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...form.register('direccion')} className="mt-1" placeholder="Ej: Calle Gran Vía, 28, Madrid" />
              {form.formState.errors.direccion && <p className="text-sm text-destructive mt-1">{form.formState.errors.direccion.message}</p>}
            </div>
            
            <div>
                <Label htmlFor="constructoraId">Cliente (Constructora)</Label>
                <Controller
                    name="constructoraId"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Input id="clienteNombre" {...form.register('clienteNombre')} className="mt-1" placeholder="Ej: Zara Home S.A." />
              {form.formState.errors.clienteNombre && <p className="text-sm text-destructive mt-1">{form.formState.errors.clienteNombre.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                    <Controller
                        name="fechaInicio"
                        control={form.control}
                        render={({ field }) => (
                             <Popover><PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", {locale: es}) : <span>Selecciona</span>}
                                </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/></PopoverContent></Popover>
                        )}
                    />
                    {form.formState.errors.fechaInicio && <p className="text-sm text-destructive mt-1">{form.formState.errors.fechaInicio.message}</p>}
                </div>
                <div>
                    <Label htmlFor="fechaFin">Fecha de Fin (Opc.)</Label>
                    <Controller
                        name="fechaFin"
                        control={form.control}
                        render={({ field }) => (
                             <Popover><PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", {locale: es}) : <span>Selecciona</span>}
                                </Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/></PopoverContent></Popover>
                        )}
                    />
                </div>
            </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Crear Proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
