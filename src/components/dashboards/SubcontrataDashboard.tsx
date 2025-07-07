// src/components/dashboards/SubcontrataDashboard.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building, Trash2, UserPlus, HardHat, FileText, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConstructoras, getProyectosByConstructora, getTrabajadoresByProyecto, removeTrabajadorFromProyecto, getReportesDiarios } from '@/lib/actions/app.actions';
import type { Constructora, Proyecto, Trabajador, ReporteDiario } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddTrabajadorDialog } from './AddTrabajadorDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';

function GestionProyectosTab() {
  const [constructoras, setConstructoras] = useState<Constructora[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  
  const [selectedConstructora, setSelectedConstructora] = useState<Constructora | null>(null);
  const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);

  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConstructoras = async () => {
      const data = await getConstructoras();
      setConstructoras(data);
    };
    fetchConstructoras();
  }, []);

  const handleSelectConstructora = async (constructora: Constructora) => {
    setSelectedConstructora(constructora);
    setSelectedProyecto(null);
    setTrabajadores([]);
    setLoadingProyectos(true);
    const proyData = await getProyectosByConstructora(constructora.id);
    setProyectos(proyData);
    setLoadingProyectos(false);
  };

  const handleSelectProyecto = async (proyecto: Proyecto) => {
    setSelectedProyecto(proyecto);
    setLoadingTrabajadores(true);
    const trabData = await getTrabajadoresByProyecto(proyecto.id);
    setTrabajadores(trabData);
    setLoadingTrabajadores(false);
  };

  const handleRemoveTrabajador = async (trabajadorId: string) => {
    if (!selectedProyecto) return;
    const result = await removeTrabajadorFromProyecto(selectedProyecto.id, trabajadorId);
    if (result.success) {
      toast({ title: "Éxito", description: `Trabajador eliminado del proyecto.` });
      setTrabajadores(prev => prev.filter(t => t.id !== trabajadorId));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const onTrabajadorAdded = useCallback((newTrabajador: Trabajador) => {
      setTrabajadores(prev => [...prev, newTrabajador]);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Columna 1: Constructoras */}
      <Card>
        <CardHeader>
          <CardTitle>1. Clientes (Constructoras)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {constructoras.map(c => (
            <Button
              key={c.id}
              variant={selectedConstructora?.id === c.id ? "secondary" : "outline"}
              className="w-full justify-start"
              onClick={() => handleSelectConstructora(c)}
            >
              <Building className="mr-2 h-4 w-4"/> {c.nombre}
            </Button>
          ))}
        </CardContent>
      </Card>
      
      {/* Columna 2: Proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>2. Proyectos</CardTitle>
          {!selectedConstructora && <CardDescription>Selecciona un cliente para ver sus proyectos.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-2">
            {loadingProyectos && <Loader2 className="animate-spin mx-auto"/>}
            {!loadingProyectos && proyectos.map(p => (
                <Button
                    key={p.id}
                    variant={selectedProyecto?.id === p.id ? "secondary" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleSelectProyecto(p)}
                >
                    <HardHat className="mr-2 h-4 w-4"/> {p.nombre}
                </Button>
            ))}
        </CardContent>
      </Card>

      {/* Columna 3: Trabajadores */}
      <Card>
        <CardHeader>
          <CardTitle>3. Trabajadores Asignados</CardTitle>
           {!selectedProyecto && <CardDescription>Selecciona un proyecto para ver sus trabajadores.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-2">
            {loadingTrabajadores && <Loader2 className="animate-spin mx-auto"/>}
            {!loadingTrabajadores && trabajadores.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <span>{t.nombre}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveTrabajador(t.id)}>
                        <Trash2 className="h-4 w-4 text-red-500"/>
                    </Button>
                </div>
            ))}
            {selectedProyecto && !loadingTrabajadores && (
                <AddTrabajadorDialog proyecto={selectedProyecto} onTrabajadorAdded={onTrabajadorAdded}>
                    <Button variant="default" className="w-full mt-4">
                        <UserPlus className="mr-2 h-4 w-4"/> Añadir Trabajador
                    </Button>
                </AddTrabajadorDialog>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

function PartesValidadosTab() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
      // Mock function gets all reports, in real app it would be filtered by subcontrata
      const data = await getReportesDiarios(undefined, undefined, subcontrataId || undefined);
      setReportes(data);
      setLoading(false);
    };
    fetchReportes();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partes Validados por Encargados</CardTitle>
        <CardDescription>Revisa los reportes diarios recibidos y listos para tu validación.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <Loader2 className="animate-spin mx-auto" />}
        {!loading && reportes.length > 0 ? (
          reportes.map(reporte => (
            <Card key={reporte.id} className="p-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <p className="font-bold text-lg">{reporte.proyectoId.replace('proy-', '').replace('-', ' ')}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>{format(reporte.fecha, "PPPP", { locale: es })}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={reporte.validacion.subcontrata.validado ? "default" : "secondary"}>
                    {reporte.validacion.subcontrata.validado ? "Validado por Subcontrata" : "Pendiente de tu Validación"}
                  </Badge>
                  <Button disabled={reporte.validacion.subcontrata.validado}>Validar</Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          !loading && <p className="text-muted-foreground text-center py-4">No hay partes pendientes de validación.</p>
        )}
      </CardContent>
    </Card>
  );
}


export default function SubcontrataDashboard() {
  return (
    <>
      <h1 className="text-3xl font-bold font-headline text-primary mb-4">Panel de Subcontrata</h1>
      <Tabs defaultValue="gestion" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gestion"><HardHat className="mr-2 h-4 w-4"/>Gestión de Proyectos</TabsTrigger>
          <TabsTrigger value="partes"><FileText className="mr-2 h-4 w-4"/>Partes Validados</TabsTrigger>
        </TabsList>
        <TabsContent value="gestion" className="mt-4">
          <GestionProyectosTab />
        </TabsContent>
        <TabsContent value="partes" className="mt-4">
          <PartesValidadosTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
