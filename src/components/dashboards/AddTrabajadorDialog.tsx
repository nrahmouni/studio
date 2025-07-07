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
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import type { Proyecto, Trabajador } from '@/lib/types';
import { addTrabajadorToProyecto } from '@/lib/actions/app.actions';

interface AddTrabajadorDialogProps {
  proyecto: Proyecto;
  onTrabajadorAdded: (newTrabajador: Trabajador) => void;
  children: React.ReactNode;
}

export function AddTrabajadorDialog({ proyecto, onTrabajadorAdded, children }: AddTrabajadorDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !codigo) {
      toast({ title: 'Error', description: 'Nombre y código son requeridos.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    const result = await addTrabajadorToProyecto(proyecto.id, proyecto.subcontrataId, nombre, codigo);
    if (result.success && result.trabajador) {
      toast({ title: 'Éxito', description: `Trabajador ${result.trabajador.nombre} añadido al proyecto.` });
      onTrabajadorAdded(result.trabajador);
      setNombre('');
      setCodigo('');
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="col-span-3"
                placeholder="Nombre Apellido"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">Código Acceso</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="col-span-3"
                placeholder="Ej: 123456"
              />
            </div>
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
