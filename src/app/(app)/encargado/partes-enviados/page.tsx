'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReporteDiario, Proyecto, Subcontrata } from '@/lib/types';
import { getReportesDiarios, getSubcontratas, getProyectosBySubcontrata } from '@/lib/actions/app.actions';
import { Loader2, FileCheck, Check, X, Clock, User, Download, Edit, MessageSquare, Building, HardHat } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function PartesEnviadosPage() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [proyectosMap, setProyectosMap] = useState<Record<string, Proyecto>>({});
  const [subcontratasMap, setSubcontratasMap] = useState<Record<string, Subcontrata>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      const encargadoId = localStorage.getItem('encargadoId_obra_link');
      
      const reportsData = await getReportesDiarios(undefined, encargadoId || undefined);
      reportsData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setReportes(reportsData);

      const subs = await getSubcontratas();
      const subMap = subs.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
      setSubcontratasMap(subMap);

      const proyPromises = subs.map(s => getProyectosBySubcontrata(s.id));
      const proyArrays = await Promise.all(proyPromises);
      const allProyectos = proyArrays.flat();
      const proyMap = allProyectos.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      setProyectosMap(proyMap);
      
      setLoading(false);
    };
    fetchReportes();
  }, []);

  const getValidationStatus = (reporte: ReporteDiario) => {
    if(reporte.validacion.constructora.validado) return {text: "Validado por todos", color: "bg-green-600"};
    if(reporte.validacion.subcontrata.validado) return {text: "Validado por Subcontrata", color: "bg-blue-500"};
    if(reporte.validacion.encargado.validado) return {text: "Enviado", color: "bg-yellow-500 text-black"};
    return {text: "Borrador", color: "bg-gray-400"};
  }

  const generatePDF = (reporte: ReporteDiario) => {
    const proyecto = proyectosMap[reporte.proyectoId];
    const subcontrata = proyecto ? subcontratasMap[proyecto.subcontrataId] : null;
    const proyectoNombre = proyecto?.nombre || reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ');
    const subcontrataNombre = subcontrata?.nombre || "N/A";

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Reporte Diario de Trabajo - ObraLink`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Proyecto: ${proyectoNombre}`, 14, 30);
    doc.text(`Subcontrata: ${subcontrataNombre}`, 14, 36);
    doc.text(`Fecha: ${format(new Date(reporte.fecha), "PPPP", { locale: es })}`, 14, 42);
    doc.text(`Enviado por (Encargado ID): ${reporte.encargadoId}`, 14, 48);

    (doc as any).autoTable({
        startY: 56,
        head: [['Trabajador', 'Asistencia', 'Horas Reportadas']],
        body: reporte.trabajadores.map(t => [
            t.nombre,
            t.asistencia ? 'Sí' : 'No',
            t.asistencia ? `${t.horas}h` : 'N/A'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 75, 109] }, // #294B6D
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    if (reporte.comentarios) {
        doc.setFontSize(12);
        doc.text("Comentarios Adicionales:", 14, finalY);
        finalY += 6;
        doc.setFontSize(10);
        const splitComments = doc.splitTextToSize(reporte.comentarios, 180);
        doc.text(splitComments, 14, finalY);
        finalY += (splitComments.length * 5) + 5;
    }

    doc.setFontSize(12);
    doc.text("Estado de Validación", 14, finalY);
    finalY += 6;
    doc.setFontSize(10);
    const { encargado, subcontrata: subValidation, constructora } = reporte.validacion;
    if(encargado.timestamp) {
      doc.text(`- Encargado: Validado el ${format(new Date(encargado.timestamp), "Pp", {locale: es})}`, 16, finalY);
      finalY += 6;
    }
    if(subValidation.timestamp) {
       doc.text(`- Subcontrata: Validado el ${format(new Date(subValidation.timestamp), "Pp", {locale: es})}`, 16, finalY);
       finalY += 6;
    } else {
       doc.text(`- Subcontrata: Pendiente`, 16, finalY);
       finalY += 6;
    }
    if (constructora.timestamp) {
        doc.text(`- Constructora: Validado el ${format(new Date(constructora.timestamp), "Pp", {locale: es})}`, 16, finalY);
    } else {
        doc.text(`- Constructora: Pendiente`, 16, finalY);
    }
    
    doc.save(`Reporte-${proyectoNombre.replace(/ /g, '_')}-${format(new Date(reporte.fecha), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">Historial de Partes Enviados</h1>
        <p className="text-muted-foreground mt-1">Consulta, modifica y descarga un registro detallado de tus reportes diarios.</p>
      </div>
      
      {reportes.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-3">
          {reportes.map(reporte => {
            const proyecto = proyectosMap[reporte.proyectoId];
            const subcontrata = proyecto ? subcontratasMap[proyecto.subcontrataId] : null;
            const status = getValidationStatus(reporte);
            const isEditable = !reporte.validacion.subcontrata.validado && !reporte.validacion.constructora.validado;

            return (
            <Card key={reporte.id} className="animate-fade-in-up transition-all duration-300 hover:shadow-md">
              <AccordionItem value={reporte.id} className="border-b-0">
                <AccordionTrigger className="p-4 hover:no-underline text-left w-full">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <FileCheck className="h-10 w-10 text-primary hidden sm:block shrink-0" />
                      <div>
                        <p className="font-bold text-lg flex items-center gap-2 capitalize"><HardHat className="h-5 w-5 text-accent"/>{proyecto?.nombre || 'Proyecto Desconocido'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Building className="h-4 w-4"/>{subcontrata?.nombre || 'Subcontrata Desconocida'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-start sm:self-center">
                       <p className="text-sm text-muted-foreground w-28 text-right">{format(new Date(reporte.fecha), "PPP", { locale: es })}</p>
                      <Badge style={{backgroundColor: status.color}} className="text-white min-w-[120px] justify-center text-center">{status.text}</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="border-t pt-4 space-y-6">
                    <div>
                        <h4 className="font-semibold text-md mb-3 flex items-center gap-2"><User className="h-4 w-4"/>Resumen de Personal</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead>Trabajador</TableHead>
                                <TableHead className="text-center">Asistencia</TableHead>
                                <TableHead className="text-right">Horas Reportadas</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reporte.trabajadores.map(trabajador => (
                                <TableRow key={trabajador.trabajadorId}>
                                  <TableCell className="font-medium">{trabajador.nombre}</TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant={trabajador.asistencia ? "default" : "destructive"} className={cn(trabajador.asistencia ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>{trabajador.asistencia ? 'Presente' : 'Ausente'}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-lg">{trabajador.asistencia ? `${trabajador.horas}h` : 'N/A'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                    </div>

                    {reporte.comentarios && (
                        <div>
                            <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4"/>Comentarios Adicionales</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md border">{reporte.comentarios}</p>
                        </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <h4 className="font-semibold text-md mb-2">Estado de Validación</h4>
                            <ul className="space-y-1 text-sm">
                                <li className="flex items-center gap-2 text-green-600"><Check className="h-4 w-4"/> <span>Validado por ti el {reporte.validacion.encargado.timestamp ? format(new Date(reporte.validacion.encargado.timestamp), 'Pp', {locale: es}) : ''}</span></li>
                                {reporte.validacion.subcontrata.validado ? (
                                    <li className="flex items-center gap-2 text-green-600"><Check className="h-4 w-4"/> <span>Validado por Subcontrata el {reporte.validacion.subcontrata.timestamp ? format(new Date(reporte.validacion.subcontrata.timestamp), 'Pp', {locale: es}) : ''}</span></li>
                                ) : (
                                    <li className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4"/> <span>Pendiente de Subcontrata</span></li>
                                )}
                                {reporte.validacion.constructora.validado ? (
                                    <li className="flex items-center gap-2 text-green-600"><Check className="h-4 w-4"/> <span>Validado por Constructora el {reporte.validacion.constructora.timestamp ? format(new Date(reporte.validacion.constructora.timestamp), 'Pp', {locale: es}) : ''}</span></li>
                                ) : (
                                    <li className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4"/> <span>Pendiente de Constructora</span></li>
                                )}
                            </ul>
                        </div>

                        <div className="flex justify-end gap-3 self-end w-full sm:w-auto">
                            <Link href={isEditable ? `/encargado/partes-enviados/${reporte.id}/edit` : '#'} passHref>
                              <Button variant="outline" disabled={!isEditable} title={!isEditable ? "No se puede modificar un reporte ya validado" : "Modificar el reporte"}>
                                  <Edit className="mr-2 h-4 w-4"/> Modificar
                              </Button>
                            </Link>
                            <Button onClick={() => generatePDF(reporte)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                                <Download className="mr-2 h-4 w-4"/> Descargar PDF
                            </Button>
                        </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          )})}
        </Accordion>
      ) : (
        <Card className="animate-fade-in-up">
            <CardContent className="p-8">
                <p className="text-muted-foreground text-center">No has enviado ningún reporte todavía.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
