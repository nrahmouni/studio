
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, HardHat, FileText, UserCheck } from 'lucide-react';
import type { Subcontrata, Proyecto, ReporteDiario } from '@/lib/types';
import { getSubcontratas, getProyectosBySubcontrata, getReportesDiarios, validateDailyReport } from '@/lib/actions/app.actions';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

function ReporteItem({ reporte, onValidate }: { reporte: ReporteDiario, onValidate: (id) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const getValidationStatus = (validacion) => {
        if(validacion.constructora.validado) return {text: "Validado por ti", color: "bg-green-500"};
        if(validacion.subcontrata.validado) return {text: "Validado (Subcontrata)", color: "bg-blue-500"};
        if(validacion.encargado.validado) return {text: "Enviado por Encargado", color: "bg-yellow-500 text-black"};
        return {text: "Pendiente", color: "bg-gray-400"};
    }
    const status = getValidationStatus(reporte.validacion);
    
    return (
         {format(parseISO(reporte.fecha), 'PPP', { locale: es })}
                         {status.text}
                     
                 
                    {isOpen ? 'Ocultar' : 'Ver Detalles'}
                    {!reporte.validacion.constructora.validado && reporte.validacion.subcontrata.validado && (
                        Validar
                    )}
                
             {reporte.encargadoId} (ID)
                     {reporte.modificacionJefeObra?.modificado && }
                   
                      Trabajadores Reportados:
                      
                         {reporte.trabajadores.map(t => (
                             - 
                                 {t.nombre}
                                  - 
                                 {t.asistencia ?  ${t.horas} horas :  Ausente}
                             
                         ))}
                      
                   
                   {reporte.comentarios && (
                     
                        Comentarios:
                        {reporte.comentarios}
                     
                   )}
                
            
        
    )
}

export default function ConstructoraPartesPage() {
  const [subcontratas, setSubcontratas] = useState([]);
  const [proyectosPorSub, setProyectosPorSub] = useState({});
  const [reportesPorProyecto, setReportesPorProyecto] = useState({});
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
      const proyMap = {};
      const allProyectos = [];
      proyectosArrays.forEach((proyArray, index) => {
        const filteredByConstructora = proyArray.filter(p => p.constructoraId === constructoraId);
        proyMap[subs[index].id] = filteredByConstructora;
        allProyectos.push(...filteredByConstructora);
      });
      setProyectosPorSub(proyMap);
      
      const promsReportes = allProyectos.map(p => getReportesDiarios(p.id));
      const reportesArrays = await Promise.all(promsReportes);
      const repMap = {};
      allProyectos.forEach((proy, index) => {
          repMap[proy.id] = reportesArrays[index];
      });
      setReportesPorProyecto(repMap);

      setLoading(false);
    };
    fetchData();
  }, [toast]);
  
  const handleValidation = async (reporteId) => {
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
    return ;
  }

  return (
    
      
        
           Seguimiento de Subcontratas
        
           Visualiza los reportes de las subcontratas por proyecto y valida su trabajo.
        
      

      
        {subcontratas.map(sub => (
          
            
              
                
                  {sub.nombre}
                
              
              
                
                   Proyectos Asignados
                  {(proyectosPorSub[sub.id] || []).length > 0 ? (
                    (proyectosPorSub[sub.id] || []).map(proy => (
                      
                         {proy.nombre}
                        
                          Reportes Diarios Recibidos
                           {(reportesPorProyecto[proy.id] || []).length > 0 ? (
                             (reportesPorProyecto[proy.id] || []).sort((a,b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime()).map(rep => (
                                
                             ))
                           ) : No hay reportes para este proyecto. }
                        
                      
                    ))
                  ) : (
                    No hay proyectos asignados a esta subcontrata para tu empresa.
                  )}
                
              
            
          
        ))}
      
    
  );
}
