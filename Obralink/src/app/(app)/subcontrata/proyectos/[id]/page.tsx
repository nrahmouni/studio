
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Calendar, Building, User, HardHat, MapPin, Briefcase, PlusCircle, Trash2, Truck, UserPlus } from 'lucide-react';
import { getProyectoById, getConstructoras, getTrabajadoresByProyecto, getMaquinariaByProyecto, removeTrabajadorFromProyecto, removeMaquinariaFromProyecto } from '@/lib/actions/app.actions';
import type { Proyecto, Constructora, Trabajador, Maquinaria } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AssignPersonalDialog } from '@/components/dashboards/AssignPersonalDialog';
import { AssignMaquinariaDialog } from '@/components/dashboards/AssignMaquinariaDialog';

export default function SubcontrataProyectoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [constructora, setConstructora] = useState<Constructora | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [maquinaria, setMaquinaria] = useState<Maquinaria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const proyectoData = await getProyectoById(projectId);
      if (!proyectoData) {
        toast({ title: "Error", description: "Proyecto no encontrado.", variant: "destructive" });
        router.push('/subcontrata/proyectos');
        return;
      }
      setProyecto(proyectoData);

      const [constructorasData, trabajadoresData, maquinariaData] = await Promise.all([
        getConstructoras(),
        getTrabajadoresByProyecto(projectId),
        getMaquinariaByProyecto(projectId),
      ]);

      const constructoraData = constructorasData.find(c => c.id === proyectoData.constructoraId);
      setConstructora(constructoraData || null);
      setTrabajadores(trabajadoresData);
      setMaquinaria(maquinariaData);

    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los detalles del proyecto.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [projectId, router, toast]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  const handleRecursoChange = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveTrabajador = async (trabajadorId: string) => {
    const result = await removeTrabajadorFromProyecto(projectId, trabajadorId);
    if (result.success) {
      toast({ title: "Éxito", description: `Trabajador desvinculado del proyecto.` });
      handleRecursoChange();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleRemoveMaquinaria = async (maquinariaId: string) => {
    const result = await removeMaquinariaFromProyecto(projectId, maquinariaId);
    if (result.success) {
      toast({ title: "Éxito", description: `Maquinaria desvinculada del proyecto.` });
      handleRecursoChange();
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const getStatus = (p: Proyecto) => {
    const now = new Date();
    const fechaFin = p.fechaFin;
    const fechaInicio = p.fechaInicio;

    if (fechaFin && fechaFin < now) return { text: "Finalizado", color: "bg-gray-500" };
    if (fechaInicio && fechaInicio > now) return { text: "Próximamente", color: "bg-blue-500" };
    return { text: "En Curso", color: "bg-green-500" };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  if (!proyecto) {
    return <div className="text-center">Proyecto no encontrado.</div>;
  }
  
  const status = getStatus(proyecto);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fade-in-down">
         <div>
            <Button variant="outline" onClick={() => router.push('/subcontrata/proyectos')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado de Proyectos
            </Button>
            <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-3"><Briefcase className="h-8 w-8"/> {proyecto.nombre}</h1>
         </div>
        <Link href={`/subcontrata/proyectos/${proyecto.id}/edit`} passHref>
          <Button size="lg">
            <Edit className="mr-2 h-5 w-5" /> Modificar Proyecto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in-up">
          <CardHeader><CardTitle>Detalles del Proyecto</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-md">
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Dirección:</span> {proyecto.direccion}</div></div>
            <div className="flex items-center gap-3"><Building className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Cliente (Constructora):</span> {constructora?.nombre || 'N/A'}</div></div>
            <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-muted-foreground"/> 
                <div>
                    <span className="font-semibold">Fechas:</span> {proyecto.fechaInicio ? format(proyecto.fechaInicio, 'd MMM yyyy', {locale: es}) : 'N/A'} - {proyecto.fechaFin ? format(proyecto.fechaFin, 'd MMM yyyy', {locale: es}) : 'Indefinido'}
                </div>
            </div>
             <div className="flex items-center gap-3"><HardHat className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Estado:</span> <Badge style={{backgroundColor: status.color}} className="text-white ml-2 text-md">{status.text}</Badge></div></div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="animate-fade-in-up animation-delay-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Asignado</CardTitle>
                <CardDescription className="text-xs">Gestiona el personal en la obra.</CardDescription>
              </div>
              <AssignPersonalDialog proyecto={proyecto} trabajadoresAsignados={trabajadores || []} onPersonalAsignado={handleRecursoChange}>
                <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4"/>Asignar</Button>
              </AssignPersonalDialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {trabajadores.length > 0 ? trabajadores.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                  <span className="flex items-center gap-3"><User className="h-5 w-5 text-primary"/>{t.nombre}</span>
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Desvincular trabajador?</AlertDialogTitle><AlertDialogDescription>Esta acción desvinculará a <strong>{t.nombre}</strong> de este proyecto.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveTrabajador(t.id)} className="bg-destructive hover:bg-destructive/90">Desvincular</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No hay personal asignado.</p>}
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up animation-delay-400">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maquinaria Asignada</CardTitle>
                <CardDescription className="text-xs">Gestiona la maquinaria en la obra.</CardDescription>
              </div>
               <AssignMaquinariaDialog proyecto={proyecto} maquinariaAsignada={maquinaria || []} onMaquinariaAsignada={handleRecursoChange}>
                  <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Asignar</Button>
                </AssignMaquinariaDialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {maquinaria.length > 0 ? maquinaria.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                  <span className="flex items-center gap-3"><Truck className="h-5 w-5 text-primary"/>{m.nombre}</span>
                  <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>¿Desvincular maquinaria?</AlertDialogTitle><AlertDialogDescription>Esta acción desvinculará a <strong>{m.nombre}</strong> de este proyecto.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveMaquinaria(m.id)} className="bg-destructive hover:bg-destructive/90">Desvincular</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No hay maquinaria asignada.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    