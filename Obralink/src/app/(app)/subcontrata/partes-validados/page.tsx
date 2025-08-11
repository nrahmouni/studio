
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
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewReport, setPreviewReport] = useState<ReporteDiario | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
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

  const generatePDF = (reporte: ReporteDiario) => {
    const doc = new jsPDF();
    const proyectoNombre = reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ');

    // Title
    doc.setFontSize(18);
    doc.text(`Reporte Diario de Trabajo - ObraLink`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Proyecto: ${proyectoNombre}`, 14, 30);
    doc.text(`Fecha: ${format(new Date(reporte.fecha), "PPPP", { locale: es })}` , 14, 36);
    doc.text(`Reportado por (Encargado ID): ${reporte.encargadoId}`, 14, 42);

    // Table
    (doc as any).autoTable({
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
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Estado de Validación", 14, finalY);
    finalY += 6;
    doc.setFontSize(10);
    if(reporte.validacion.encargado.timestamp) {
      doc.text(`- Encargado: Validado el ${format(new Date(reporte.validacion.encargado.timestamp), "Pp", {locale: es})}`, 16, finalY);
      finalY += 6;
    }
    if(reporte.validacion.subcontrata.timestamp) {
       doc.text(`- Subcontrata: Validado el ${format(new Date(reporte.validacion.subcontrata.timestamp), "Pp", {locale: es})}`, 16, finalY);
       finalY += 6;
    }
    if (reporte.validacion.constructora.validado && reporte.validacion.constructora.timestamp) {
        doc.text(`- Constructora: Validado el ${format(new Date(reporte.validacion.constructora.timestamp), "Pp", {locale: es})}`, 16, finalY);
    } else {
        doc.text(`- Constructora: Pendiente de validación`, 16, finalY);
    }


    // Save the PDF
    doc.save(`Reporte-${proyectoNombre.replace(/ /g, '_')}-${format(new Date(reporte.fecha), 'yyyy-MM-dd')}.pdf`);
  };

  const handleValidate = async (reporte: ReporteDiario) => {
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
    <div className="space-y-6">
      <div className="animate-fade-in-down">
         <h1 className="text-3xl font-bold font-headline text-primary">Partes a Validar</h1>
         <p className="text-muted-foreground mt-1">Revisa los reportes diarios recibidos y listos para tu validación.</p>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Pendientes de Validación</CardTitle>
          <CardDescription>Estos partes han sido enviados por los encargados y requieren tu aprobación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="text-center p-8"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>}
          {!loading && reportes.length > 0 ? (
            reportes.map(reporte => (
              <Card key={reporte.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <HardHat className="h-8 w-8 text-accent"/>
                    <div>
                        <p className="font-bold text-lg capitalize">{reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>{format(new Date(reporte.fecha), "PPPP", { locale: es })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <Badge variant={reporte.validacion.subcontrata.validado ? "default" : "secondary"} className={reporte.validacion.subcontrata.validado ? "bg-green-600 text-white" : ""}>
                      {reporte.validacion.subcontrata.validado ? "Validado por ti" : "Pendiente de tu Validación"}
                    </Badge>
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPreviewReport(reporte)}
                        title="Previsualizar"
                    >
                        <Eye className="h-5 w-5" />
                        <span className="sr-only">Previsualizar</span>
                    </Button>
                    <Button 
                        onClick={() => handleValidate(reporte)} 
                        disabled={reporte.validacion.subcontrata.validado || validatingId === reporte.id} 
                        size="lg" 
                        className="bg-accent text-accent-foreground hover:bg-accent/90 w-36"
                    >
                        {validatingId === reporte.id ? <Loader2 className="animate-spin" /> : (reporte.validacion.subcontrata.validado ? 'Validado' : 'Validar')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            !loading && <p className="text-muted-foreground text-center py-6">No hay partes pendientes de validación en este momento.</p>
          )}
        </CardContent>
      </Card>
      <ReportePreviewDialog
        isOpen={!!previewReport}
        onOpenChange={(isOpen) => { if (!isOpen) setPreviewReport(null); }}
        reporte={previewReport}
      />
    </div>
  );
}
