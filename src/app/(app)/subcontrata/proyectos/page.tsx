'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Building, Trash2, UserPlus, HardHat, User, Truck, MapPin, Hash, PlusCircle } from 'lucide-react';
import { getConstructoras, getProyectosBySubcontrata, getTrabajadoresByProyecto, removeTrabajadorFromProyecto, getMaquinariaByProyecto, removeMaquinariaFromProyecto } from '@/lib/actions/app.actions';
import type { Constructora, Proyecto, Trabajador, Maquinaria } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { AssignPersonalDialog } from '@/components/dashboards/AssignPersonalDialog';
import { AssignMaquinariaDialog } from '@/components/dashboards/AssignMaquinariaDialog';

export default function GestionProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [constructoraMap, setConstructoraMap] = useState<Record<string, string>>({});
  const [trabajadoresPorProyecto, setTrabajadoresPorProyecto] = useState<Record<string, Trabajador[]>>({});
  const [maquinariaPorProyecto, setMaquinariaPorProyecto] = useState<Record<string, Maquinaria[]>>({});
  
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingRecursosProyectoId, setLoadingRecursosProyectoId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
      toast({ title: "Error", description: "No se pudo identificar la subcontrata.", variant: "destructive" });
      setLoadingProyectos(false);
      return;
    }
    setLoadingProyectos(true);
    const [proyectosData, constructorasData] = await Promise.all([
        getProyectosBySubcontrata(subcontrataId),
        getConstructoras(),
    ]);

    setProyectos(proyectosData.sort((a,b) => new Date(b.fechaInicio || 0).getTime() - new Date(a.fechaInicio || 0).getTime()));
    const conMap = constructorasData.reduce((acc, c) => ({...acc, [c.id]: c.nombre}), {});
    setConstructoraMap(conMap);
    setLoadingProyectos(false);
  }, [toast]);
  
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleAccordionChange = useCallback(async (projectId: string) => {
    if (!projectId) return; // Accordion collapsed
    if (trabajadoresPorProyecto[projectId] && maquinariaPorProyecto[projectId]) return; // Data already fetched

    setLoadingRecursosProyectoId(projectId);
    const [workers, machines] = await Promise.all([
        getTrabajadoresByProyecto(projectId),
        getMaquinariaByProyecto(projectId),
    ]);
    setTrabajadoresPorProyecto(prev => ({ ...prev, [projectId]: workers }));
    setMaquinariaPorProyecto(prev => ({ ...prev, [projectId]: machines }));
    setLoadingRecursosProyectoId(null);
  }, [trabajadoresPorProyecto, maquinariaPorProyecto]);

  const handleRecursoChange = useCallback((projectId: string) => {
    // This forces a re-fetch of resources for a specific project
    setTrabajadoresPorProyecto(prev => { const newPrev = {...prev}; delete newPrev[projectId]; return newPrev; });
    setMaquinariaPorProyecto(prev => { const newPrev = {...prev}; delete newPrev[projectId]; return newPrev; });
    handleAccordionChange(projectId);
  }, [handleAccordionChange]);


  const handleRemoveTrabajador = async (proyectoId: string, trabajadorId: string) => {
    const result = await removeTrabajadorFromProyecto(proyectoId, trabajadorId);
    if (result.success) {
      toast({ title: "Éxito", description: `Trabajador desvinculado del proyecto.` });
      handleRecursoChange(proyectoId);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleRemoveMaquinaria = async (proyectoId: string, maquinariaId: string) => {
    const result = await removeMaquinariaFromProyecto(proyectoId, maquinariaId);
    if (result.success) {
      toast({ title: "Éxito", description: `Maquinaria desvinculada del proyecto.` });
      handleRecursoChange(proyectoId);
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
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
        <p className="text-muted-foreground mt-1">Consulta tus proyectos asignados y gestiona el personal y maquinaria de cada uno.</p>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Listado de Proyectos Asignados</CardTitle>
          <CardDescription>Haz clic en un proyecto para ver sus detalles y asignar recursos.</CardDescription>
        </CardHeader>
        <CardContent>
            {proyectos.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4" onValueChange={handleAccordionChange}>
                    {proyectos.map(proyecto => {
                        const status = getStatus(proyecto);
                        const trabajadores = trabajadoresPorProyecto[proyecto.id];
                        const maquinaria = maquinariaPorProyecto[proyecto.id];
                        const isLoadingResources = loadingRecursosProyectoId === proyecto.id;
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
                                        <div className="border-t pt-4 space-y-6">
                                            {/* Project Info */}
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/>{proyecto.direccion}</p>
                                                <p className="flex items-center gap-2"><Hash className="h-4 w-4"/>ID: {proyecto.id}</p>
                                            </div>

                                            {isLoadingResources ? <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-primary"/></div> : (
                                                <>
                                                    {/* Personal Section */}
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-lg flex items-center justify-between">
                                                            <span>Personal Asignado</span>
                                                            <AssignPersonalDialog proyecto={proyecto} trabajadoresAsignados={trabajadores || []} onPersonalAsignado={() => handleRecursoChange(proyecto.id)}>
                                                                <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4"/>Asignar Personal</Button>
                                                            </AssignPersonalDialog>
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {trabajadores && trabajadores.length > 0 ? trabajadores.map(t => (
                                                                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                                                    <span className="flex items-center gap-3 text-base"><User className="h-5 w-5 text-muted-foreground"/> {t.nombre}</span>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-5 w-5"/></Button></AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader><AlertDialogTitle>¿Desvincular trabajador?</AlertDialogTitle><AlertDialogDescription>Esta acción desvinculará a <strong>{t.nombre}</strong> de este proyecto.</AlertDialogDescription></AlertDialogHeader>
                                                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveTrabajador(proyecto.id, t.id)} className="bg-destructive hover:bg-destructive/90">Desvincular</AlertDialogAction></AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            )) : <p className="text-muted-foreground text-center py-2">No hay personal asignado a este proyecto.</p>}
                                                        </div>
                                                    </div>

                                                    {/* Maquinaria Section */}
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-lg flex items-center justify-between">
                                                            <span>Maquinaria Asignada</span>
                                                            <AssignMaquinariaDialog proyecto={proyecto} maquinariaAsignada={maquinaria || []} onMaquinariaAsignada={() => handleRecursoChange(proyecto.id)}>
                                                                <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Asignar Maquinaria</Button>
                                                            </AssignMaquinariaDialog>
                                                        </h4>
                                                         <div className="space-y-3">
                                                            {maquinaria && maquinaria.length > 0 ? maquinaria.map(m => (
                                                                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                                                    <span className="flex items-center gap-3 text-base"><Truck className="h-5 w-5 text-muted-foreground"/> {m.nombre}</span>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-5 w-5"/></Button></AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader><AlertDialogTitle>¿Desvincular maquinaria?</AlertDialogTitle><AlertDialogDescription>Esta acción desvinculará a <strong>{m.nombre}</strong> de este proyecto.</AlertDialogDescription></AlertDialogHeader>
                                                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveMaquinaria(proyecto.id, m.id)} className="bg-destructive hover:bg-destructive/90">Desvincular</AlertDialogAction></AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            )) : <p className="text-muted-foreground text-center py-2">No hay maquinaria asignada a este proyecto.</p>}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
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

    