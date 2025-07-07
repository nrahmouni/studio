'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ReporteDiario } from '@/lib/types';
import { getReportesDiarios } from '@/lib/actions/app.actions';
import { Loader2, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function PartesEnviadosPage() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      // In a real app, you'd filter by the current encargado's ID
      const encargadoId = localStorage.getItem('encargadoId_obra_link');
      // The mock function doesn't use the ID, it returns all reports
      const data = await getReportesDiarios(undefined, encargadoId || undefined);
      setReportes(data);
      setLoading(false);
    };
    fetchReportes();
  }, []);

  if (loading) {
    return <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">Historial de Partes Enviados</h1>
        <p className="text-muted-foreground mt-1">Aquí puedes ver un registro de los reportes diarios que has enviado.</p>
      </div>
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Mis Reportes</CardTitle>
          <CardDescription>Listado de todos los reportes diarios enviados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportes.length > 0 ? (
            reportes.map(reporte => (
              <Card key={reporte.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                     <FileCheck className="h-8 w-8 text-primary" />
                     <div>
                        <p className="font-bold text-lg">{reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">Fecha: {format(new Date(reporte.fecha), "PPP", { locale: es })}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <Badge variant="secondary">{reporte.trabajadores.length} trabajadores</Badge>
                    <Badge className={reporte.validacion.encargado.validado ? "bg-green-500 text-white" : ""}>
                      {reporte.validacion.encargado.validado ? "Enviado" : "Borrador"}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No has enviado ningún reporte todavía.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
