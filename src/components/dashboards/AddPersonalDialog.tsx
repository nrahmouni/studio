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
import type { Trabajador } from '@/lib/types';
import { addTrabajador } from '@/lib/actions/app.actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

interface AddPersonalDialogProps {
  onPersonalAdded: (newPersonal: Trabajador) => void;
  children: React.ReactNode;
}

const AddPersonalFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  categoriaProfesional: z.enum(["oficial", "peon", "maquinista", "encofrador"], { required_error: "La categoría es requerida"}),
  codigoAcceso: z.string().min(1, "El código de acceso es requerido"),
});

type AddPersonalFormData = z.infer<typeof AddPersonalFormSchema>;

export function AddPersonalDialog({ onPersonalAdded, children }: AddPersonalDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<AddPersonalFormData>({
    resolver: zodResolver(AddPersonalFormSchema),
    defaultValues: {
      nombre: '',
      codigoAcceso: '',
    },
  });

  const handleSubmit = async (data: AddPersonalFormData) => {
    form.clearErrors();
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
        toast({ title: 'Error', description: 'No se pudo identificar la subcontrata.', variant: 'destructive' });
        return;
    }

    const result = await addTrabajador({ subcontrataId, ...data });
    if (result.success && result.trabajador) {
      toast({ title: 'Éxito', description: `Personal ${result.trabajador.nombre} añadido.` });
      onPersonalAdded(result.trabajador);
      form.reset();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Personal</DialogTitle>
          <DialogDescription>
            Introduce los detalles del nuevo miembro del equipo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input id="nombre" {...form.register('nombre')} className="col-span-3" placeholder="Nombre completo" />
            </div>
            {form.formState.errors.nombre && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.nombre.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoria" className="text-right">Categoría</Label>
               <Controller
                  name="categoriaProfesional"
                  control={form.control}
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} >
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
              <Input id="codigo" {...form.register('codigoAcceso')} className="col-span-3" placeholder="Ej: 123456" />
            </div>
             {form.formState.errors.codigoAcceso && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.codigoAcceso.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
