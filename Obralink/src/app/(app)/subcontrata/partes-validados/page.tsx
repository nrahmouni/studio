
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, HardHat, Eye } from 'lucide-react';
import { getReportesDiarios, validateDailyReport } from '@/lib/actions/app.actions';
import type { ReporteDiario } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ReportePreviewDialog } from '@/components/dashboards/ReportePreviewDialog';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function SubcontrataPartesValidadosPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewReport, setPreviewReport] = useState(null);
  const [validatingId, setValidatingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
      // Mock function gets all reports, in real app it would be filtered by subcontrata
      const data = await getReportesDiarios(undefined, undefined, subcontrataId || undefined);
      // Filter for reports that have been validated by the encargado
      setReportes(data.filter(r => r.validacion.encargado.validado));
      setLoading(false);
    };
    fetchReportes();
  }, []);

  const generatePDF = (reporte) => {
    const doc = new jsPDF();
    const proyectoNombre = reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ');

    // Title
    doc.setFontSize(18);
    doc.text(Reporte Diario de Trabajo - ObraLink, 14, 22);
    doc.setFontSize(11);
    doc.text(Proyecto: ${proyectoNombre}, 14, 30);
    doc.text(Fecha: ${format(parseISO(reporte.fecha), "PPPP", { locale: es })} , 14, 36);
    doc.text(Reportado por (Encargado ID): ${reporte.encargadoId}, 14, 42);

    // Table
    (doc ).autoTable({
        startY: 50,
        head: [['Trabajador', 'Asistencia', 'Horas Reportadas']],
        body: reporte.trabajadores.map(t => [
            t.nombre,
            t.asistencia ? 'Sí' : 'No',
            t.asistencia ? `${t.horas}h` : 'N/A'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 75, 109] }, // #294B6D
    });

    // Validation Status
    let finalY = (doc ).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Estado de Validación", 14, finalY);
    finalY += 6;
    doc.setFontSize(10);
    if(reporte.validacion.encargado.timestamp) {
      doc.text(- Encargado: Validado el ${format(parseISO(reporte.validacion.encargado.timestamp), "Pp", {locale: es})}, 16, finalY);
      finalY += 6;
    }
    if(reporte.validacion.subcontrata.timestamp) {
       doc.text(- Subcontrata: Validado el ${format(parseISO(reporte.validacion.subcontrata.timestamp), "Pp", {locale: es})}, 16, finalY);
       finalY += 6;
    }
    if (reporte.validacion.constructora.validado && reporte.validacion.constructora.timestamp) {
        doc.text(- Constructora: Validado el ${format(parseISO(reporte.validacion.constructora.timestamp), "Pp", {locale: es})}, 16, finalY);
    } else {
        doc.text(- Constructora: Pendiente de validación, 16, finalY);
    }


    // Save the PDF
    doc.save(Reporte-${proyectoNombre.replace(/ /g, '_')}-${format(parseISO(reporte.fecha), 'yyyy-MM-dd')}.pdf);
  };

  const handleValidate = async (reporte) => {
    setValidatingId(reporte.id);
    const result = await validateDailyReport(reporte.id, 'subcontrata');
    if (result.success && result.reporte) {
        toast({
            title: "Éxito",
            description: "Reporte validado. Generando PDF...",
        });

        setReportes(prev => prev.map(r => r.id === reporte.id ? result.reporte! : r));
        
        generatePDF(result.reporte);
    } else {
        toast({
            variant: "destructive",
            title: "Error de Validación",
            description: result.message,
        });
    }
    setValidatingId(null);
  };


  return (
    
      
         
           Partes a Validar
         
           Revisa los reportes diarios recibidos y listos para tu validación.
        
      

      
        
          Pendientes de Validación
          
           Estos partes han sido enviados por los encargados y requieren tu aprobación.
        
        
          {loading && }
          {!loading && reportes.length > 0 ? (
            reportes.map(reporte => (
              
                
                  
                    
                      
                        {reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ')}
                        
                        {format(parseISO(reporte.fecha), "PPPP", { locale: es })}
                      
                    
                  
                  
                      
                         Validado por ti : Pendiente de tu Validación}
                      
                       
                        
                          
                           
                        
                      
                      
                          
                           
                          
                       
                    
                  
                
              
            ))
          ) : (
            !loading && No hay partes pendientes de validación en este momento.
          )}
        
      
      
        
        
        reporte={previewReport}
      
    
  );
}
