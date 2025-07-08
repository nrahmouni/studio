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
import { Loader2, Truck } from 'lucide-react';
import type { Maquinaria } from '@/lib/types';
import { addMaquinaria } from '@/lib/actions/app.actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface AddMaquinariaDialogProps {
  onMaquinariaAdded: (newMaquinaria: Maquinaria) => void;
  children: React.ReactNode;
}

const AddMaquinariaFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  matriculaORef: z.string().min(1, "La matrícula o referencia es requerida"),
});

type AddMaquinariaFormData = z.infer<typeof AddMaquinariaFormSchema>;

export function AddMaquinariaDialog({ onMaquinariaAdded, children }: AddMaquinariaDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<AddMaquinariaFormData>({
    resolver: zodResolver(AddMaquinariaFormSchema),
    defaultValues: {
      nombre: '',
      matriculaORef: '',
    },
  });

  const handleSubmit = async (data: AddMaquinariaFormData) => {
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
        toast({ title: 'Error', description: 'No se pudo identificar la subcontrata.', variant: 'destructive' });
        return;
    }

    const result = await addMaquinaria({ subcontrataId, ...data });
    if (result.success && result.maquinaria) {
      toast({ title: 'Éxito', description: `Maquinaria ${result.maquinaria.nombre} añadida.` });
      onMaquinariaAdded(result.maquinaria);
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
          <DialogTitle>Añadir Maquinaria</DialogTitle>
          <DialogDescription>
            Introduce los detalles de la nueva maquinaria o vehículo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input id="nombre" {...form.register('nombre')} className="col-span-3" placeholder="Ej: Retroexcavadora CAT" />
            </div>
             {form.formState.errors.nombre && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.nombre.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matriculaORef" className="text-right">Matrícula/Ref.</Label>
              <Input id="matriculaORef" {...form.register('matriculaORef')} className="col-span-3" placeholder="Ej: E-1234-BCD o REF-01" />
            </div>
            {form.formState.errors.matriculaORef && <p className="col-span-4 text-right text-sm text-destructive">{form.formState.errors.matriculaORef.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
              Guardar Maquinaria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
