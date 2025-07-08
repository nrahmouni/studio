'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Truck } from 'lucide-react';
import type { Proyecto, Maquinaria } from '@/lib/types';
import { getMaquinariaBySubcontrata, assignMaquinariaToProyecto } from '@/lib/actions/app.actions';

interface AssignMaquinariaDialogProps {
  proyecto: Proyecto;
  maquinariaAsignada: Maquinaria[];
  onMaquinariaAsignada: () => void;
  children: React.ReactNode;
}

export function AssignMaquinariaDialog({ proyecto, maquinariaAsignada, onMaquinariaAsignada, children }: AssignMaquinariaDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableMaquinaria, setAvailableMaquinaria] = useState<Maquinaria[]>([]);
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<Record<string, boolean>>({});

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
        const toda = await getMaquinariaBySubcontrata(subcontrataId);
        const asignadaIds = new Set(maquinariaAsignada.map(m => m.id));
        setAvailableMaquinaria(toda.filter(m => !asignadaIds.has(m.id)));
        setIsLoading(false);
      };
      fetchAvailable();
      setSelectedMaquinaria({});
    }
  }, [open, maquinariaAsignada, toast]);

  const handleSelectionChange = (maquinariaId: string, checked: boolean) => {
    setSelectedMaquinaria(prev => ({
      ...prev,
      [maquinariaId]: checked,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const idsToAssign = Object.keys(selectedMaquinaria).filter(id => selectedMaquinaria[id]);

    if(idsToAssign.length === 0) {
        toast({ title: 'Sin selección', description: 'Por favor, selecciona al menos una maquinaria para asignar.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }

    const result = await assignMaquinariaToProyecto(proyecto.id, idsToAssign);
    if (result.success) {
      toast({ title: 'Éxito', description: 'Maquinaria asignada al proyecto.' });
      onMaquinariaAsignada();
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
          <DialogTitle>Asignar Maquinaria a {proyecto.nombre}</DialogTitle>
          <DialogDescription>
            Selecciona la maquinaria de tu empresa que quieres asignar a este proyecto.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : availableMaquinaria.length > 0 ? (
                 <ScrollArea className="h-72">
                    <div className="space-y-3 pr-4">
                        {availableMaquinaria.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50">
                                <Label htmlFor={`maq-${m.id}`} className="flex items-center gap-3 font-normal cursor-pointer">
                                    <Truck className="h-5 w-5 text-muted-foreground"/>
                                    {m.nombre} <span className="text-xs text-muted-foreground">({m.matriculaORef})</span>
                                </Label>
                                <Checkbox
                                    id={`maq-${m.id}`}
                                    checked={!!selectedMaquinaria[m.id]}
                                    onCheckedChange={(checked) => handleSelectionChange(m.id, !!checked)}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <p className="text-center text-muted-foreground py-10">No hay más maquinaria disponible para asignar.</p>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isLoading || availableMaquinaria.length === 0}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
            Asignar Maquinaria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    