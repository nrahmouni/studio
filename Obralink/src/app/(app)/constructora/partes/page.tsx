
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, HardHat, FileText, UserCheck, Calendar, AlertTriangle } from 'lucide-react';
import type { Subcontrata, Proyecto, ReporteDiario } from '@/lib/types';
import { getSubcontratas, getProyectosByConstructora, getReportesDiariosByConstructora, validateDailyReport } from '@/lib/actions/app.actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function ReporteItem({ reporte, onValidate }: { reporte: ReporteDiario, onValidate: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const getValidationStatus = (validacion: ReporteDiario['validacion']) => {
        if(validacion.constructora.validado) return {text: "Validado por ti", className: "bg-primary text-primary-foreground"};
        if(validacion.subcontrata.validado) return {text: "Validado (Subcontrata)", className: "bg-accent text-accent-foreground"};
        if(validacion.encargado.validado) return {text: "Enviado por Encargado", className: "bg-secondary text-secondary-foreground"};
        return {text: "Pendiente", className: "bg-muted text-muted-foreground"};
    }
    const status = getValidationStatus(reporte.validacion);
    
    return (
        <Card className="p-3 bg-card hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-center gap-3">
                 <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary"/>
                    <span className="font-semibold">
                      Reporte del {format(new Date(reporte.fecha), 'PPP', { locale: es })}
                    </span>
                    <Badge className={cn("text-white", status.className)}>{status.text}</Badge>
                 </div>

                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'Ocultar' : 'Ver Detalles'}</Button>
                    {!reporte.validacion.constructora.validado && reporte.validacion.subcontrata.validado && (
                        <Button onClick={() => onValidate(reporte.id)} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Validar</Button>
                    )}
                 </div>
            </div>
             {isOpen && (
                <div className="mt-4 p-4 bg-background rounded-md border space-y-3 animate-fade-in-up">
                   <p className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4"/>Reportado por: <span className="font-normal">{reporte.encargadoId} (ID)</span></p>
                   {reporte.modificacionJefeObra?.modificado && (
                        <p className="font-semibold text-accent flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>
                            Este parte fue modificado por el jefe de obra.
                        </p>
                   )}
                   <div className="space-y-1">
                      <p className="font-semibold">Trabajadores Reportados:</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                         {reporte.trabajadores.map(t => (
                             <li key={t.trabajadorId}>
                                 <span className="font-medium">{t.nombre}</span> - 
                                 <span className={!t.asistencia ? 'text-destructive' : ''}> {t.asistencia ? ` ${t.horas} horas` :  'Ausente'}</span>
                             </li>
                         ))}
                      </ul>
                   </div>
                   
                   {reporte.comentarios && (
                     <div className="pt-2">
                        <p className="font-semibold">Comentarios:</p>
                        <p className="text-sm text-muted-foreground p-2 bg-muted/50 border rounded-md">{reporte.comentarios}</p>
                     </div>
                   )}
                </div>
            )}
        </Card>
    )
}

export default function ConstructoraPartesPage() {
  const [subcontratas, setSubcontratas] = useState<Subcontrata[]>([]);
  const [proyectosPorSub, setProyectosPorSub] = useState<Record<string, Proyecto[]>>({});
  const [reportesPorProyecto, setReportesPorProyecto] = useState<Record<string, ReporteDiario[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const constructoraId = localStorage.getItem('constructoraId_obra_link');
      if (!constructoraId) {
        toast({ title: "Error", description: "No se pudo identificar la constructora.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      const subs = await getSubcontratas();
      setSubcontratas(subs);

      const allProyectos = await getProyectosByConstructora(constructoraId);
      
      const proyMap: Record<string, Proyecto[]> = {};
      subs.forEach((sub) => {
          const proyectosDeSubcontrataParaEstaConstructora = allProyectos.filter(p => p.subcontrataId === sub.id);
          proyMap[sub.id] = proyectosDeSubcontrataParaEstaConstructora;
      });
      setProyectosPorSub(proyMap);
      
      if (allProyectos.length > 0) {
        const reportes = await getReportesDiariosByConstructora(constructoraId);
        const repMap: Record<string, ReporteDiario[]> = {};
        allProyectos.forEach(p => {
            repMap[p.id] = reportes.filter(r => r.proyectoId === p.id);
        })
        setReportesPorProyecto(repMap);
      }

      setLoading(false);
    };
    fetchData();
  }, [toast]);
  
  const handleValidation = async (reporteId: string) => {
    const result = await validateDailyReport(reporteId, 'constructora');
    if (result.success && result.reporte) {
      toast({ title: 'Éxito', description: 'Reporte validado correctamente.' });
      setReportesPorProyecto(prev => {
        const newReportes = { ...prev };
        const projectId = result.reporte!.proyectoId;
        if (newReportes[projectId]) {
          const reportIndex = newReportes[projectId].findIndex(r => r.id === reporteId);
          if (reportIndex !== -1) {
            newReportes[projectId][reportIndex] = result.reporte!;
          }
        }
        return newReportes;
      });
    } else {
       toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  }

  if (loading) {
    return <div className="text-center p-8"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">Seguimiento de Subcontratas</h1>
        <p className="text-muted-foreground mt-1">Visualiza los reportes de las subcontratas por proyecto y valida su trabajo.</p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {subcontratas.map(sub => {
            const proyectosDeEstaSub = proyectosPorSub[sub.id] || [];
            if (proyectosDeEstaSub.length === 0) return null;

            return (
              <Card key={sub.id} className="animate-fade-in-up">
                <AccordionItem value={sub.id} className="border-b-0">
                  <AccordionTrigger className="p-6 text-xl hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Building className="h-6 w-6 text-primary" />
                      {sub.nombre}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><HardHat className="h-5 w-5"/>Proyectos Asignados</h3>
                      {proyectosDeEstaSub.map(proy => (
                          <Card key={proy.id} className="p-4 bg-muted/50">
                            <p className="font-bold text-base capitalize">{proy.nombre}</p>
                            <div className="mt-2 space-y-3 pl-4 border-l-2 border-accent/50 ml-2">
                              <h4 className="font-semibold mt-3 text-muted-foreground">Reportes Diarios Recibidos</h4>
                               {(reportesPorProyecto[proy.id] || []).length > 0 ? (
                                 (reportesPorProyecto[proy.id] || []).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(rep => (
                                    <ReporteItem key={rep.id} reporte={rep} onValidate={handleValidation} />
                                 ))
                               ) : <p className="text-sm text-muted-foreground">No hay reportes para este proyecto.</p> }
                            </div>
                          </Card>
                        ))
                      }
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            )
        })}
      </Accordion>
    </div>
  );
}
