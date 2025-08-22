
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, Loader2, Calendar, HardHat, Edit, Download, Check, Clock, User, MessageSquare, Building, MapPin, Hash, FileCheck, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReporteDiario, Proyecto, Subcontrata } from '@/lib/types';
import { getReportesDiarios, getProyectosBySubcontrata, getSubcontratas } from '@/lib/actions/app.actions';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cn } from '@/lib/utils';

export default function AsistenciaDashboardPage() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [proyectosMap, setProyectosMap] = useState<Record<string, Proyecto>>({});
  const [subcontratasMap, setSubcontratasMap] = useState<Record<string, Subcontrata>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      const encargadoId = localStorage.getItem('encargadoId_obra_link');
      if (encargadoId) {
        const data = await getReportesDiarios(undefined, encargadoId);
        setReportes(data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
        
        const subs = await getSubcontratas();
        const subMap = subs.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
        setSubcontratasMap(subMap);

        const proyPromises = subs.map(s => getProyectosBySubcontrata(s.id));
        const proyArrays = await Promise.all(proyPromises);
        const allProyectos = proyArrays.flat();
        const proyMap = allProyectos.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        setProyectosMap(proyMap);
      }
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
    let currentY = 22;

    doc.setFontSize(18);
    doc.text(`Reporte de Asistencia - ObraLink`, 14, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.text(`Proyecto: ${proyectoNombre}`, 14, currentY);
    currentY += 6;
    doc.text(`ID Obra: ${reporte.proyectoId}`, 14, currentY);
    currentY += 6;
    if (proyecto?.direccion) {
        doc.text(`Dirección: ${proyecto.direccion}`, 14, currentY);
        currentY += 6;
    }
    doc.text(`Subcontrata: ${subcontrataNombre}`, 14, currentY);
    currentY += 6;
    doc.text(`Fecha: ${format(parseISO(reporte.fecha), "PPPP", { locale: es })}` , 14, currentY);
    currentY += 6;
    doc.text(`Enviado por (Encargado ID): ${reporte.encargadoId}`, 14, currentY);

    (doc as any).autoTable({
        startY: currentY + 8,
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
      doc.text(`- Encargado: Validado el ${format(parseISO(encargado.timestamp), "Pp", {locale: es})}`, 16, finalY);
      finalY += 6;
    }
    if(subValidation.timestamp) {
       doc.text(`- Subcontrata: Validado el ${format(parseISO(subValidation.timestamp), "Pp", {locale: es})}`, 16, finalY);
       finalY += 6;
    } else {
       doc.text(`- Subcontrata: Pendiente`, 16, finalY);
       finalY += 6;
    }
    if (constructora.timestamp) {
        doc.text(`- Constructora: Validado el ${format(parseISO(constructora.timestamp), "Pp", {locale: es})}`, 16, finalY);
    } else {
        doc.text(`- Constructora: Pendiente`, 16, finalY);
    }
    
    doc.save(`Asistencia-${proyectoNombre.replace(/ /g, '_')}-${format(parseISO(reporte.fecha), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-8">
        <div className="animate-fade-in-down">
            <h1 className="text-3xl font-bold font-headline text-primary">Control de Asistencia</h1>
            <p className="text-muted-foreground mt-1">Consulta los registros de asistencia pasados o crea uno nuevo desde el módulo de "Reporte Diario".</p>
        </div>

        <div className="animate-fade-in-up">
            <Link href="/encargado/reporte-diario" passHref>
                <Button size="lg" className="w-full text-lg py-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <PlusCircle className="mr-3 h-6 w-6" />
                    Crear Nuevo Reporte Diario (con Asistencia)
                </Button>
            </Link>
        </div>

        <Card className="animate-fade-in-up animation-delay-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary" /> Historial de Partes</CardTitle>
                <CardDescription>Estos son los últimos reportes que has guardado, que incluyen la asistencia. Haz clic para ver detalles o editar.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : reportes.length > 0 ? (
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
                                    <p className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3"/> {proyecto?.direccion || 'Dirección no especificada'}</span>
                                        <span className="flex items-center gap-1.5"><Hash className="h-3 w-3"/> ID: {proyecto?.id}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 self-start sm:self-center">
                                   <p className="text-sm text-muted-foreground w-28 text-right">{format(parseISO(reporte.fecha), "PPP", { locale: es })}</p>
                                   <div className="flex flex-col items-end gap-1">
                                      <Badge style={{backgroundColor: status.color}} className="text-white min-w-[120px] justify-center text-center">{status.text}</Badge>
                                      {reporte.modificacionJefeObra?.modificado && <Badge variant="destructive" className="mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/>Modificado</Badge>}
                                   </div>
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
                                 
                                {reporte.modificacionJefeObra?.modificado && reporte.modificacionJefeObra.timestamp && (
                                    <div>
                                        <h4 className="font-semibold text-md mb-2 flex items-center gap-2 text-orange-600"><Edit className="h-4 w-4"/>Historial de Modificación</h4>
                                        <div className="text-sm text-muted-foreground bg-orange-500/10 p-3 rounded-md border border-orange-500/20">
                                            <p>Este reporte fue modificado por el jefe de obra (ID: {reporte.modificacionJefeObra.jefeObraId}) el {format(parseISO(reporte.modificacionJefeObra.timestamp), 'Pp', {locale: es})}.</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                    <div>
                                        <h4 className="font-semibold text-md mb-2">Estado de Validación</h4>
                                        <ul className="space-y-1 text-sm">
                                            <li className="flex items-center gap-2 text-green-600"><Check className="h-4 w-4"/> <span>Validado por ti el {reporte.validacion.encargado.timestamp ? format(parseISO(reporte.validacion.encargado.timestamp), 'Pp', {locale: es}) : ''}</span></li>
                                            {reporte.validacion.subcontrata.validado && reporte.validacion.subcontrata.timestamp ? (
                                                <li className="flex items-center gap-2 text-green-600"><Check className="h-4 w-4"/> <span>Validado por Subcontrata el {format(parseISO(reporte.validacion.subcontrata.timestamp), 'Pp', {locale: es})}</span></li>
                                            ) : (
                                                <li className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4"/> <span>Pendiente de Subcontrata</span></li>
                                            )}
                                            {reporte.validacion.constructora.validado && reporte.validacion.constructora.timestamp ? (
                                                <li className="flex items-center gap-2 text-green-600"><Check className="h-4 w-4"/> <span>Validado por Constructora el {format(parseISO(reporte.validacion.constructora.timestamp), 'Pp', {locale: es})}</span></li>
                                            ) : (
                                                <li className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4"/> <span>Pendiente de Constructora</span></li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="flex justify-end gap-3 self-end w-full sm:w-auto">
                                        <Link href={isEditable ? `/encargado/asistencia/${reporte.id}/edit` : '#'} passHref>
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
                    <p className="text-center text-muted-foreground py-6">No hay registros de asistencia guardados.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
