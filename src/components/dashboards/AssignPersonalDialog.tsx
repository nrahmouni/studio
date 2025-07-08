'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, User } from 'lucide-react';
import type { Proyecto, Trabajador } from '@/lib/types';
import { getTrabajadoresBySubcontrata, assignTrabajadoresToProyecto } from '@/lib/actions/app.actions';

interface AssignPersonalDialogProps {
  proyecto: Proyecto;
  trabajadoresAsignados: Trabajador[];
  onPersonalAsignado: () => void;
  children: React.ReactNode;
}

export function AssignPersonalDialog({ proyecto, trabajadoresAsignados, onPersonalAsignado, children }: AssignPersonalDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTrabajadores, setAvailableTrabajadores] = useState<Trabajador[]>([]);
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      const fetchAvailable = async () => {
        setIsLoading(true);
        const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
        if (!subcontrataId) {
            toast({ title: 'Error', description: 'No se pudo identificar la subcontrata.', variant: 'destructive' });
            setIsLoading(false);
            return;
        }
        const todos = await getTrabajadoresBySubcontrata(subcontrataId);
        const asignadosIds = new Set(trabajadoresAsignados.map(t => t.id));
        setAvailableTrabajadores(todos.filter(t => !asignadosIds.has(t.id)));
        setIsLoading(false);
      };
      fetchAvailable();
      setSelectedTrabajadores({});
    }
  }, [open, trabajadoresAsignados, toast]);

  const handleSelectionChange = (trabajadorId: string, checked: boolean) => {
    setSelectedTrabajadores(prev => ({
      ...prev,
      [trabajadorId]: checked,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const idsToAssign = Object.keys(selectedTrabajadores).filter(id => selectedTrabajadores[id]);

    if(idsToAssign.length === 0) {
        toast({ title: 'Sin selección', description: 'Por favor, selecciona al menos un trabajador para asignar.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    const result = await assignTrabajadoresToProyecto(proyecto.id, idsToAssign);
    if (result.success) {
      toast({ title: 'Éxito', description: 'Personal asignado al proyecto.' });
      onPersonalAsignado();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Personal a {proyecto.nombre}</DialogTitle>
          <DialogDescription>
            Selecciona el personal de tu empresa que quieres asignar a este proyecto.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : availableTrabajadores.length > 0 ? (
                 <ScrollArea className="h-72">
                    <div className="space-y-3 pr-4">
                        {availableTrabajadores.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50">
                                <Label htmlFor={`trab-${t.id}`} className="flex items-center gap-3 font-normal cursor-pointer">
                                    <User className="h-5 w-5 text-muted-foreground"/>
                                    {t.nombre}
                                </Label>
                                <Checkbox
                                    id={`trab-${t.id}`}
                                    checked={!!selectedTrabajadores[t.id]}
                                    onCheckedChange={(checked) => handleSelectionChange(t.id, !!checked)}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <p className="text-center text-muted-foreground py-10">No hay más personal disponible para asignar.</p>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isLoading || availableTrabajadores.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Asignar Personal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    