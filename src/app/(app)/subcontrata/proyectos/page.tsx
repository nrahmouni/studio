'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Building, Trash2, UserPlus, HardHat, User, MapPin, Hash } from 'lucide-react';
import { getConstructoras, getProyectosBySubcontrata, getTrabajadoresByProyecto, removeTrabajadorFromProyecto } from '@/lib/actions/app.actions';
import type { Constructora, Proyecto, Trabajador } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddTrabajadorDialog } from '@/components/dashboards/AddTrabajadorDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

export default function GestionProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [constructoraMap, setConstructoraMap] = useState<Record<string, string>>({});
  const [trabajadoresPorProyecto, setTrabajadoresPorProyecto] = useState<Record<string, Trabajador[]>>({});
  
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingTrabajadoresProyectoId, setLoadingTrabajadoresProyectoId] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
      toast({ title: "Error", description: "No se pudo identificar la subcontrata.", variant: "destructive" });
      setLoadingProyectos(false);
      return;
    }
    const fetchData = async () => {
        setLoadingProyectos(true);
        const [proyectosData, constructorasData] = await Promise.all([
            getProyectosBySubcontrata(subcontrataId),
            getConstructoras(),
        ]);

        setProyectos(proyectosData.sort((a,b) => new Date(b.fechaInicio || 0).getTime() - new Date(a.fechaInicio || 0).getTime()));
        const conMap = constructorasData.reduce((acc, c) => ({...acc, [c.id]: c.nombre}), {});
        setConstructoraMap(conMap);
        setLoadingProyectos(false);
    };
    fetchData();
  }, [toast]);

  const handleAccordionChange = async (projectId: string) => {
    if (!projectId) return; // Accordion collapsed
    if (trabajadoresPorProyecto[projectId]) return; // Data already fetched

    setLoadingTrabajadoresProyectoId(projectId);
    const workers = await getTrabajadoresByProyecto(projectId);
    setTrabajadoresPorProyecto(prev => ({ ...prev, [projectId]: workers }));
    setLoadingTrabajadoresProyectoId(null);
  };

  const handleRemoveTrabajador = async (proyectoId: string, trabajadorId: string) => {
    const result = await removeTrabajadorFromProyecto(proyectoId, trabajadorId);
    if (result.success) {
      toast({ title: "Éxito", description: `Trabajador eliminado del proyecto.` });
      setTrabajadoresPorProyecto(prev => ({
          ...prev,
          [proyectoId]: prev[proyectoId]?.filter(t => t.id !== trabajadorId) || []
      }));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const onTrabajadorAdded = useCallback((proyectoId: string, newTrabajador: Trabajador) => {
      setTrabajadoresPorProyecto(prev => {
        const currentWorkers = prev[proyectoId] || [];
        return {
          ...prev,
          [proyectoId]: [...currentWorkers, newTrabajador]
        };
      });
  }, []);

  const getStatus = (proyecto: Proyecto) => {
    const now = new Date();
    if (proyecto.fechaFin && new Date(proyecto.fechaFin) < now) return { text: "Finalizado", color: "bg-gray-500" };
    if (proyecto.fechaInicio && new Date(proyecto.fechaInicio) > now) return { text: "Próximamente", color: "bg-blue-500" };
    return { text: "En Curso", color: "bg-green-500" };
  }

  if (loadingProyectos) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Gestión de Proyectos y Recursos</h1>
        <p className="text-muted-foreground mt-1">Consulta tus proyectos asignados y gestiona el personal de cada uno.</p>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Listado de Proyectos Asignados</CardTitle>
          <CardDescription>Haz clic en un proyecto para ver y asignar trabajadores.</CardDescription>
        </CardHeader>
        <CardContent>
            {proyectos.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleAccordionChange}>
                    {proyectos.map(proyecto => {
                        const status = getStatus(proyecto);
                        const trabajadores = trabajadoresPorProyecto[proyecto.id];
                        const isLoadingWorkers = loadingTrabajadoresProyectoId === proyecto.id;
                        return (
                            <Card key={proyecto.id} className="animate-fade-in-up transition-shadow hover:shadow-md">
                                <AccordionItem value={proyecto.id} className="border-b-0">
                                    <AccordionTrigger className="p-4 hover:no-underline text-left">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-3">
                                            <div className="flex items-center gap-4">
                                                <HardHat className="h-10 w-10 text-primary hidden sm:block"/>
                                                <div>
                                                    <p className="font-bold text-lg">{proyecto.nombre}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4"/>Cliente: <span className="font-semibold text-foreground">{constructoraMap[proyecto.constructoraId] || 'N/A'}</span></p>
                                                </div>
                                            </div>
                                             <div className="flex items-center gap-4 self-end sm:self-center">
                                                <Badge style={{backgroundColor: status.color}} className="text-white">{status.text}</Badge>
                                             </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="border-t pt-4 space-y-4">
                                            <h4 className="font-semibold text-lg">Personal Asignado</h4>
                                            {isLoadingWorkers && <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-primary"/></div>}
                                            {trabajadores && (
                                                <div className="space-y-3">
                                                    {trabajadores.length > 0 ? trabajadores.map(t => (
                                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                                            <span className="flex items-center gap-3 text-lg"><User className="h-5 w-5 text-muted-foreground"/> {t.nombre}</span>
                                                            <AlertDialog>
                                                              <AlertDialogTrigger asChild>
                                                                  <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-5 w-5"/></Button>
                                                              </AlertDialogTrigger>
                                                              <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Desvincular trabajador?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción eliminará a <strong>{t.nombre}</strong> de este proyecto, pero no lo eliminará de tu empresa.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleRemoveTrabajador(proyecto.id, t.id)} className="bg-destructive hover:bg-destructive/90">Desvincular</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                              </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    )) : <p className="text-muted-foreground text-center py-4">No hay trabajadores asignados a este proyecto.</p>}
                                                </div>
                                            )}
                                            <AddTrabajadorDialog 
                                                proyecto={proyecto} 
                                                onTrabajadorAdded={(newWorker) => onTrabajadorAdded(proyecto.id, newWorker)}
                                            >
                                                <Button variant="outline" className="w-full mt-4">
                                                    <UserPlus className="mr-2 h-4 w-4"/> Asignar o Añadir Trabajador
                                                </Button>
                                            </AddTrabajadorDialog>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Card>
                        );
                    })}
                </Accordion>
            ) : (
                <p className="text-center py-6 text-muted-foreground">No tienes proyectos asignados.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
