// src/components/dashboards/AddTrabajadorDialog.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import type { Proyecto, Trabajador } from '@/lib/types';
import { addTrabajadorToProyecto } from '@/lib/actions/app.actions';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';


interface AddTrabajadorDialogProps {
  proyecto: Proyecto;
  onTrabajadorAdded: (newTrabajador: Trabajador) => void;
  children: React.ReactNode;
}

const AddTrabajadorFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido."),
  codigoAcceso: z.string().min(1, "El código de acceso es requerido."),
  categoriaProfesional: z.enum(["oficial", "peon", "maquinista", "encofrador"], {
      required_error: "La categoría profesional es requerida."
  }),
});
type AddTrabajadorFormData = z.infer<typeof AddTrabajadorFormSchema>;


export function AddTrabajadorDialog({ proyecto, onTrabajadorAdded, children }: AddTrabajadorDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddTrabajadorFormData>({
    resolver: zodResolver(AddTrabajadorFormSchema),
    defaultValues: {
      nombre: '',
      codigoAcceso: '',
    },
  });

  const handleSubmit = async (data: AddTrabajadorFormData) => {
    setIsSubmitting(true);

    const result = await addTrabajadorToProyecto(proyecto.id, proyecto.subcontrataId, data.nombre, data.codigoAcceso, data.categoriaProfesional);
    if (result.success && result.trabajador) {
      toast({ title: 'Éxito', description: `Trabajador ${result.trabajador.nombre} añadido al proyecto.` });
      onTrabajadorAdded(result.trabajador);
      form.reset();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Trabajador a {proyecto.nombre}</DialogTitle>
          <DialogDescription>
            Introduce los detalles del nuevo trabajador para este proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input
                id="nombre"
                {...form.register('nombre')}
                className="col-span-3"
                placeholder="Nombre Apellido"
              />
            </div>
            {form.formState.errors.nombre && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.nombre.message}</p>}

             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoria" className="text-right">Categoría</Label>
                <Controller
                    name="categoriaProfesional"
                    control={form.control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona categoría" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="oficial">Oficial</SelectItem>
                        <SelectItem value="peon">Peón</SelectItem>
                        <SelectItem value="maquinista">Maquinista</SelectItem>
                        <SelectItem value="encofrador">Encofrador</SelectItem>
                        </SelectContent>
                    </Select>
                    )}
                />
            </div>
            {form.formState.errors.categoriaProfesional && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.categoriaProfesional.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">Código Acceso</Label>
              <Input
                id="codigo"
                {...form.register('codigoAcceso')}
                className="col-span-3"
                placeholder="Ej: 123456"
              />
            </div>
             {form.formState.errors.codigoAcceso && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.codigoAcceso.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Guardar Trabajador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
