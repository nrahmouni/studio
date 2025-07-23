
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReporteDiario, Proyecto, Subcontrata } from '@/lib/types';
import { getReportesDiarios, getSubcontratas, getProyectosBySubcontrata } from '@/lib/actions/app.actions';
import { Loader2, FileCheck, Check, Clock, User, Download, Edit, MessageSquare, Building, HardHat, MapPin, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function PartesEnviadosPage() {
  const [reportes, setReportes] = useState([]);
  const [proyectosMap, setProyectosMap] = useState({});
  const [subcontratasMap, setSubcontratasMap] = useState({});
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
    doc.text(Reporte Diario de Trabajo - ObraLink, 14, currentY);
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
    
    doc.save(Reporte-${proyectoNombre.replace(/ /g, '_')}-${format(parseISO(reporte.fecha), 'yyyy-MM-dd')}.pdf);
  };

  if (loading) {
    return ;
  }

  return (
    
      
        
           Historial de Partes Enviados
        
           Consulta, modifica y descarga un registro detallado de tus reportes diarios.
        
      
      
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
                               
                               {reporte.validacion.subcontrata.validado ? (
                                    
                                      Validado por Subcontrata el {reporte.validacion.subcontrata.timestamp ? format(parseISO(reporte.validacion.subcontrata.timestamp), 'Pp', {locale: es}) : ''}
                                    
                                ) : (
                                    
                                      Pendiente de Subcontrata
                                    
                                )}
                               {reporte.validacion.constructora.validado ? (
                                    
                                      Validado por Constructora el {reporte.validacion.constructora.timestamp ? format(parseISO(reporte.validacion.constructora.timestamp), 'Pp', {locale: es}) : ''}
                                    
                                ) : (
                                    
                                      Pendiente de Constructora
                                    
                                )}
                           
                        

                        
                           
                                Modificar
                           
                           
                                Descargar PDF
                           
                        
                    
                  
                
              
            
          })}
        
      
       No has enviado ningún reporte todavía.
    
  );
}
