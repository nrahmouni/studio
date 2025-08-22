
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getReporteDiarioById, getTrabajadoresByProyecto, updateDailyReport } from '@/lib/actions/app.actions';
import type { ReporteTrabajador, Trabajador } from '@/lib/types';
import { Loader2, Save, User, Plus, Minus, ArrowLeft, AlertTriangle } from 'lucide-react';

interface TrabajadorConEstado extends Trabajador {
  asistencia: boolean;
  horas: number;
}

export default function ModificarAsistenciaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const reporteId = params.id as string;

  const [trabajadores, setTrabajadores] = useState<TrabajadorConEstado[]>([]);
  const [proyectoNombre, setProyectoNombre] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reporteId) return;

    const fetchReporteData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const reporte = await getReporteDiarioById(reporteId);

        if (!reporte) {
          setError("Reporte no encontrado.");
          setIsLoading(false);
          return;
        }
        
        if (reporte.validacion.subcontrata.validado || reporte.validacion.constructora.validado) {
          setError("Este reporte ya ha sido validado por la subcontrata o constructora y no puede ser modificado.");
          setIsLoading(false);
          return;
        }

        setProyectoNombre(reporte.proyectoId.replace('proy-', '').replace(/-/g, ' '));
        
        const todosTrabajadores = await getTrabajadoresByProyecto(reporte.proyectoId);
        const trabajadoresConEstado = todosTrabajadores.map(t => {
          const reporteTrabajador = reporte.trabajadores.find(rt => rt.trabajadorId === t.id);
          return {
            ...t,
            asistencia: reporteTrabajador?.asistencia ?? false,
            horas: reporteTrabajador?.horas ?? 8,
          };
        });
        setTrabajadores(trabajadoresConEstado);
      } catch (e) {
          setError("Ocurrió un error al cargar los datos del reporte.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReporteData();
  }, [reporteId]);

  const handleTrabajadorChange = (trabajadorId: string, field: 'asistencia' | 'horas', value: boolean | number) => {
    setTrabajadores(prev =>
      prev.map(t =>
        t.id === trabajadorId ? { ...t, [field]: value } : t
      )
    );
  };
  
  const handleSaveChanges = async () => {
    if (!reporteId) {
        toast({ title: "Error", description: "ID de reporte no encontrado.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    
    const reporteActualizado: ReporteTrabajador[] = trabajadores
      .filter(t => t.asistencia)
      .map(t => ({
        trabajadorId: t.id,
        nombre: t.nombre,
        asistencia: true,
        horas: t.horas,
      }));

    if (reporteActualizado.length === 0) {
      toast({
        title: "Atención",
        description: "No se puede guardar un reporte si no ha asistido ningún trabajador.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const result = await updateDailyReport(reporteId, reporteActualizado);
    if(result.success) {
        toast({ title: "Éxito", description: "El registro de asistencia se ha actualizado correctamente." });
        router.push('/encargado/asistencia');
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  if (error) {
     return (
        <div className="container mx-auto py-8">
            <Card className="max-w-xl mx-auto border-destructive bg-destructive/10 text-destructive-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle/> Error de Modificación</CardTitle>
                    <CardDescription className="text-destructive-foreground/80">{error}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Volver
                    </Button>
                </CardContent>
            </Card>
        </div>
     );
  }

  return (
    <div className="space-y-6">
       <div className='flex items-center justify-between'>
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Modificar Asistencia</h1>
          <p className="text-muted-foreground mt-1 capitalize">Estás editando el registro de asistencia para el proyecto: <span className="font-semibold">{proyectoNombre}</span></p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4"/> Volver
        </Button>
      </div>

       <Card className="animate-fade-in-up">
         <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>Valida la Asistencia y Horas</span>
          </CardTitle>
          <CardDescription>Ajusta la asistencia y las horas de cada trabajador y guarda los cambios.</CardDescription>
        </CardHeader>
        <CardContent>
          {trabajadores.length > 0 ? (
            <div className="space-y-4">
              {trabajadores.map(t => (
                <div key={t.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4">
                  <Label htmlFor={`asistencia-${t.id}`} className="text-lg font-medium flex items-center gap-3 cursor-pointer">
                      <User className="h-5 w-5 text-muted-foreground"/>
                      {t.nombre}
                  </Label>
                  <div className="flex items-center gap-4 sm:gap-6">
                      <div className="flex items-center gap-2">
                          <Checkbox
                              id={`asistencia-${t.id}`}
                              checked={t.asistencia}
                              onCheckedChange={(checked) => handleTrabajadorChange(t.id, 'asistencia', !!checked)}
                              className="w-6 h-6"
                          />
                          <Label htmlFor={`asistencia-${t.id}`} className="text-md font-medium cursor-pointer">Asiste</Label>
                      </div>
                      <div className="flex items-center gap-2">
                          <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-full"
                              onClick={() => handleTrabajadorChange(t.id, 'horas', Math.max(0, t.horas - 1))}
                              disabled={!t.asistencia || t.horas <= 0}
                          >
                              <Minus className="h-5 w-5" />
                          </Button>
                          <span className="font-bold text-xl w-12 text-center tabular-nums">
                              {t.asistencia ? `${t.horas}h` : '--'}
                          </span>
                          <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-full"
                              onClick={() => handleTrabajadorChange(t.id, 'horas', Math.min(12, t.horas + 1))}
                              disabled={!t.asistencia || t.horas >= 12}
                          >
                              <Plus className="h-5 w-5" />
                          </Button>
                      </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                      Cancelar
                  </Button>
                  <Button onClick={handleSaveChanges} disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <Save className="mr-2 h-5 w-5"/>}
                      Guardar Cambios
                  </Button>
              </div>
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-4">No hay trabajadores asignados a este proyecto.</p>
          )}
        </CardContent>
       </Card>
    </div>
  );
}
