'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, HardHat, FileText, Calendar, UserCheck } from 'lucide-react';
import type { Subcontrata, Proyecto, ReporteDiario } from '@/lib/types';
import { getSubcontratas, getProyectosBySubcontrata, getReportesDiarios } from '@/lib/actions/app.actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConstructoraDashboard() {
  const [subcontratas, setSubcontratas] = useState<Subcontrata[]>([]);
  const [proyectosPorSub, setProyectosPorSub] = useState<Record<string, Proyecto[]>>({});
  const [reportesPorProyecto, setReportesPorProyecto] = useState<Record<string, ReporteDiario[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const subs = await getSubcontratas();
      setSubcontratas(subs);

      const promsProyectos = subs.map(s => getProyectosBySubcontrata(s.id));
      const proyectosArrays = await Promise.all(promsProyectos);
      const proyMap: Record<string, Proyecto[]> = {};
      const allProyectos: Proyecto[] = [];
      proyectosArrays.forEach((proyArray, index) => {
        proyMap[subs[index].id] = proyArray;
        allProyectos.push(...proyArray);
      });
      setProyectosPorSub(proyMap);
      
      const promsReportes = allProyectos.map(p => getReportesDiarios(p.id));
      const reportesArrays = await Promise.all(promsReportes);
      const repMap: Record<string, ReporteDiario[]> = {};
      reportesArrays.forEach((repArray, index) => {
        repMap[allProyectos[index].id] = repArray;
      });
      setReportesPorProyecto(repMap);

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-8"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-down">
        <CardHeader>
          <CardTitle>Panel de la Constructora</CardTitle>
          <CardDescription>Visualiza los reportes de las subcontratas por proyecto.</CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
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
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg mb-2">Proyectos Activos</h3>
                  {(proyectosPorSub[sub.id] || []).length > 0 ? (
                    proyectosPorSub[sub.id].map(proy => (
                      <Card key={proy.id} className="p-4 bg-muted/50">
                        <p className="font-bold flex items-center gap-2"><HardHat className="h-5 w-5 text-accent"/>{proy.nombre}</p>
                        <div className="mt-2 space-y-2 pl-4 border-l-2 border-accent/50 ml-2">
                          <h4 className="font-semibold mt-3">Reportes Diarios Recibidos</h4>
                           {(reportesPorProyecto[proy.id] || []).length > 0 ? (
                             reportesPorProyecto[proy.id].map(rep => (
                                <ReporteItem key={rep.id} reporte={rep} />
                             ))
                           ) : <p className="text-sm text-muted-foreground">No hay reportes para este proyecto.</p> }
                        </div>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay proyectos asignados a esta subcontrata.</p>
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

function ReporteItem({ reporte }: { reporte: ReporteDiario }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const getValidationStatus = (validacion: ReporteDiario['validacion']) => {
        if(validacion.constructora.validado) return {text: "Validado (Constructora)", color: "bg-green-500"};
        if(validacion.subcontrata.validado) return {text: "Validado (Subcontrata)", color: "bg-blue-500"};
        if(validacion.encargado.validado) return {text: "Enviado por Encargado", color: "bg-yellow-500"};
        return {text: "Pendiente", color: "bg-gray-400"};
    }
    const status = getValidationStatus(reporte.validacion);
    
    return (
        <Card className="p-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary"/>
                    <span className="font-semibold">
                      Reporte del {format(new Date(reporte.fecha), 'PPP', { locale: es })}
                    </span>
                    <Badge style={{backgroundColor: status.color}} className="text-white">{status.text}</Badge>
                    {reporte.modificacionJefeObra?.modificado && <Badge variant="destructive">Modificado</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>Ver Detalles</Button>
            </div>
            {isOpen && (
                <div className="mt-4 p-4 bg-background rounded-md border space-y-3">
                   <p className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4"/>Fecha: <span className="font-normal">{format(new Date(reporte.fecha), 'PPPP', { locale: es })}</span></p>
                   <p className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4"/>Reportado por: <span className="font-normal">{reporte.encargadoId} (ID)</span></p>
                   <div className="space-y-1">
                      <p className="font-semibold">Trabajadores Reportados:</p>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                         {reporte.trabajadores.map(t => (
                           <li key={t.trabajadorId}>
                                <span className="font-medium">{t.nombre}</span> - 
                                {t.asistencia ? ` ${t.horas} horas` : ' Ausente'}
                           </li>
                         ))}
                      </ul>
                   </div>
                   <div className="pt-2 text-right">
                       <Button variant="outline" disabled>Modificar Reporte (Próximamente)</Button>
                   </div>
                </div>
            )}
        </Card>
    )
}
