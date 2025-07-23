
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, HardHat, FileText, Calendar, UserCheck } from 'lucide-react';
import type { Subcontrata, Proyecto, ReporteDiario } from '@/lib/types';
import { getSubcontratas, getProyectosBySubcontrata, getReportesDiarios, validateDailyReport } from '@/lib/actions/app.actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

function ReporteItem({ reporte, onValidate }: { reporte: ReporteDiario, onValidate: (id: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const getValidationStatus = (validacion: ReporteDiario['validacion']) => {
        if(validacion.constructora.validado) return {text: "Validado por ti", color: "bg-green-500"};
        if(validacion.subcontrata.validado) return {text: "Validado (Subcontrata)", color: "bg-blue-500"};
        if(validacion.encargado.validado) return {text: "Enviado por Encargado", color: "bg-yellow-500"};
        return {text: "Pendiente", color: "bg-gray-400"};
    }
    const status = getValidationStatus(reporte.validacion);
    
    return (
        <Card className="p-3 bg-card hover:bg-muted/50 transition-colors">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary"/>
                    <div className="flex flex-col">
                        <span className="font-semibold">
                          Reporte del {format(new Date(reporte.fecha), 'PPP', { locale: es })}
                        </span>
                        <Badge style={{backgroundColor: status.color}} className="text-white w-fit mt-1">{status.text}</Badge>
                    </div>
                </div>
                 <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'Ocultar' : 'Ver Detalles'}</Button>
                    {!reporte.validacion.constructora.validado && reporte.validacion.subcontrata.validado && (
                        <Button size="sm" onClick={() => onValidate(reporte.id)} className="bg-accent text-accent-foreground hover:bg-accent/90">Validar</Button>
                    )}
                </div>
            </div>
            {isOpen && (
                <div className="mt-4 p-4 bg-background rounded-md border space-y-3 animate-fade-in-up">
                   <p className="font-semibold flex items-center gap-2 text-sm"><UserCheck className="h-4 w-4"/>Reportado por: <span className="font-normal">{reporte.encargadoId} (ID)</span></p>
                   {reporte.modificacionJefeObra?.modificado && <Badge variant="destructive">Modificado por Jefe de Obra</Badge>}
                   <div className="space-y-1">
                      <p className="font-semibold text-sm">Trabajadores Reportados:</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                         {reporte.trabajadores.map(t => (
                           <li key={t.trabajadorId}>
                                <span className="font-medium">{t.nombre}</span> - 
                                {t.asistencia ? ` ${t.horas} horas` : ' Ausente'}
                           </li>
                         ))}
                      </ul>
                   </div>
                   {reporte.comentarios && (
                     <div>
                        <p className="font-semibold text-sm">Comentarios:</p>
                        <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md border mt-1">{reporte.comentarios}</p>
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
      // In a real app, getSubcontratas would be filtered by constructoraId
      const subs = await getSubcontratas();
      setSubcontratas(subs);

      const promsProyectos = subs.map(s => getProyectosBySubcontrata(s.id));
      const proyectosArrays = await Promise.all(promsProyectos);
      const proyMap: Record<string, Proyecto[]> = {};
      const allProyectos: Proyecto[] = [];
      proyectosArrays.forEach((proyArray, index) => {
        const filteredByConstructora = proyArray.filter(p => p.constructoraId === constructoraId);
        proyMap[subs[index].id] = filteredByConstructora;
        allProyectos.push(...filteredByConstructora);
      });
      setProyectosPorSub(proyMap);
      
      const promsReportes = allProyectos.map(p => getReportesDiarios(p.id));
      const reportesArrays = await Promise.all(promsReportes);
      const repMap: Record<string, ReporteDiario[]> = {};
      allProyectos.forEach((proy, index) => {
          repMap[proy.id] = reportesArrays[index];
      });
      setReportesPorProyecto(repMap);

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

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={subcontratas[0]?.id}>
        {subcontratas.map(sub => (
          <Card key={sub.id} className="animate-fade-in-up">
            <AccordionItem value={sub.id} className="border-b-0">
              <AccordionTrigger className="p-6 text-xl hover:no-underline">
                <div className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-primary" />
                  {sub.nombre}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-2 border-b pb-2">Proyectos Asignados</h3>
                  {(proyectosPorSub[sub.id] || []).length > 0 ? (
                    (proyectosPorSub[sub.id] || []).map(proy => (
                      <Card key={proy.id} className="p-4 bg-muted/50">
                        <p className="font-bold flex items-center gap-2 text-base"><HardHat className="h-5 w-5 text-accent"/>{proy.nombre}</p>
                        <div className="mt-3 space-y-3 pl-4 border-l-2 border-accent/50 ml-2">
                          <h4 className="font-semibold mt-3 text-muted-foreground">Reportes Diarios Recibidos</h4>
                           {(reportesPorProyecto[proy.id] || []).length > 0 ? (
                             (reportesPorProyecto[proy.id] || []).map(rep => (
                                <ReporteItem key={rep.id} reporte={rep} onValidate={handleValidation} />
                             ))
                           ) : <p className="text-sm text-muted-foreground p-2">No hay reportes para este proyecto.</p> }
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">No hay proyectos asignados a esta subcontrata para tu empresa.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}

