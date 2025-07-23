
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, Loader2, Calendar, HardHat, Edit, Download, Check, Clock, User, MessageSquare, Building, MapPin, Hash, FileCheck } from 'lucide-react';
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
  const [reportes, setReportes] = useState([]);
  const [proyectosMap, setProyectosMap] = useState({});
  const [subcontratasMap, setSubcontratasMap] = useState({});
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

  const getValidationStatus = (reporte) => {
    if(reporte.validacion.constructora.validado) return {text: "Validado por todos", color: "bg-green-600"};
    if(reporte.validacion.subcontrata.validado) return {text: "Validado por Subcontrata", color: "bg-blue-500"};
    if(reporte.validacion.encargado.validado) return {text: "Enviado", color: "bg-yellow-500 text-black"};
    return {text: "Borrador", color: "bg-gray-400"};
  }

  const generatePDF = (reporte) => {
    const proyecto = proyectosMap[reporte.proyectoId];
    const subcontrata = proyecto ? subcontratasMap[proyecto.subcontrataId] : null;
    const proyectoNombre = proyecto?.nombre || reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ');
    const subcontrataNombre = subcontrata?.nombre || "N/A";

    const doc = new jsPDF();
    let currentY = 22;

    doc.setFontSize(18);
    doc.text(Reporte de Asistencia - ObraLink, 14, currentY);
    currentY += 8;

    doc.setFontSize(11);
    doc.text(Proyecto: ${proyectoNombre}, 14, currentY);
    currentY += 6;
    doc.text(ID Obra: ${reporte.proyectoId}, 14, currentY);
    currentY += 6;
    if (proyecto?.direccion) {
        doc.text(Dirección: ${proyecto.direccion}, 14, currentY);
        currentY += 6;
    }
    doc.text(Subcontrata: ${subcontrataNombre}, 14, currentY);
    currentY += 6;
    doc.text(Fecha: ${format(parseISO(reporte.fecha), "PPPP", { locale: es })} , 14, currentY);
    currentY += 6;
    doc.text(Enviado por (Encargado ID): ${reporte.encargadoId}, 14, currentY);

    (doc ).autoTable({
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

    let finalY = (doc ).lastAutoTable.finalY + 10;
    
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
      doc.text(- Encargado: Validado el ${format(parseISO(encargado.timestamp), "Pp", {locale: es})}, 16, finalY);
      finalY += 6;
    }
    if(subValidation.timestamp) {
       doc.text(- Subcontrata: Validado el ${format(parseISO(subValidation.timestamp), "Pp", {locale: es})}, 16, finalY);
       finalY += 6;
    } else {
       doc.text(- Subcontrata: Pendiente, 16, finalY);
       finalY += 6;
    }
    if (constructora.timestamp) {
        doc.text(- Constructora: Validado el ${format(parseISO(constructora.timestamp), "Pp", {locale: es})}, 16, finalY);
    } else {
        doc.text(- Constructora: Pendiente, 16, finalY);
    }
    
    doc.save(Asistencia-${proyectoNombre.replace(/ /g, '_')}-${format(parseISO(reporte.fecha), 'yyyy-MM-dd')}.pdf);
  };

  return (
    
        
            
               Control de Asistencia
            
               Consulta los registros de asistencia pasados o crea uno nuevo.
            
        

        
            
               
                    Crear Nuevo Reporte Diario (con Asistencia)
                
            
        

        
            
                Historial de Partes
                
                 Estos son los últimos reportes que has guardado, que incluyen la asistencia. Haz clic para ver detalles o editar.
            
            
                {loading ? (
                    
                        
                    
                ) : reportes.length > 0 ? (
                    
                      {reportes.map(reporte => {
                        const proyecto = proyectosMap[reporte.proyectoId];
                        const subcontrata = proyecto ? subcontratasMap[proyecto.subcontrataId] : null;
                        const status = getValidationStatus(reporte);
                        const isEditable = !reporte.validacion.subcontrata.validado && !reporte.validacion.constructora.validado;

                        return (
                        
                          
                            
                              
                                
                                  
                                    {proyecto?.nombre || 'Proyecto Desconocido'}
                                    
                                    {subcontrata?.nombre || 'Subcontrata Desconocida'}
                                    
                                        
                                         {proyecto?.direccion || 'Dirección no especificada'}
                                        
                                         ID: {proyecto?.id}
                                        
                                    
                                  
                                
                                
                                   
                                      {status.text}
                                      {reporte.modificacionJefeObra?.modificado && }
                                   
                                
                              
                            
                            
                              
                                
                                   Resumen de Personal
                                
                                
                                  
                                    
                                      Trabajador
                                      
                                      Asistencia
                                      
                                      Horas Reportadas
                                    
                                  
                                  
                                    {reporte.trabajadores.map(trabajador => (
                                      
                                        
                                          {trabajador.nombre}
                                          
                                          
                                            {trabajador.asistencia ? 'Presente' : 'Ausente'}
                                          
                                          
                                            {trabajador.asistencia ? `${trabajador.horas}h` : 'N/A'}
                                          
                                        
                                      
                                    ))}
                                  
                                
                            

                            {reporte.comentarios && (
                                
                                   Comentarios Adicionales
                                   {reporte.comentarios}
                                
                            )}
                             
                            {reporte.modificacionJefeObra?.modificado && reporte.modificacionJefeObra.timestamp && (
                                
                                   Historial de Modificación
                                   
                                       Este reporte fue modificado por el jefe de obra (ID: {reporte.modificacionJefeObra.jefeObraId}) el {format(parseISO(reporte.modificacionJefeObra.timestamp), 'Pp', {locale: es})}.
                                   
                                
                            )}
                            
                            
                                
                                   Estado de Validación
                                   
                                       
                                         Validado por ti el {reporte.validacion.encargado.timestamp ? format(parseISO(reporte.validacion.encargado.timestamp), 'Pp', {locale: es}) : ''}
                                       
                                       {reporte.validacion.subcontrata.validado && reporte.validacion.subcontrata.timestamp ? (
                                            
                                               Validado por Subcontrata el {format(parseISO(reporte.validacion.subcontrata.timestamp), 'Pp', {locale: es})}
                                            
                                       ) : (
                                            
                                               Pendiente de Subcontrata
                                            
                                       )}
                                       {reporte.validacion.constructora.validado && reporte.validacion.constructora.timestamp ? (
                                            
                                               Validado por Constructora el {format(parseISO(reporte.validacion.constructora.timestamp), 'Pp', {locale: es})}
                                            
                                       ) : (
                                            
                                               Pendiente de Constructora
                                            
                                       )}
                                   
                                

                                
                                   
                                       Modificar
                                   
                                   
                                       Descargar PDF
                                   
                                
                            
                          
                        
                      })}
                    
                ) : (
                    
                        
                            No hay registros de asistencia guardados.
                        
                    
                )}
            
        
    
  );
}
