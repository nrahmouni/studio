'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ReporteDiario } from '@/lib/types';
import { getReportesDiarios } from '@/lib/actions/app.actions';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    <Card>
      <CardHeader>
        <CardTitle>Partes Enviados</CardTitle>
        <CardDescription>Aquí puedes ver un historial de los reportes diarios que has enviado.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reportes.length > 0 ? (
          reportes.map(reporte => (
            <Card key={reporte.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Proyecto: {reporte.proyectoId.replace('proy-', '').replace('-', ' ')}</p>
                  <p className="text-sm text-muted-foreground">Fecha: {format(new Date(reporte.fecha), "PPP", { locale: es })}</p>
                </div>
                <div className="text-right">
                  <p>{reporte.trabajadores.length} trabajadores reportados</p>
                  <p className="text-sm font-bold text-primary">{reporte.validacion.encargado.validado ? "Enviado" : "Borrador"}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">No has enviado ningún reporte todavía.</p>
        )}
      </CardContent>
    </Card>
  );
}
