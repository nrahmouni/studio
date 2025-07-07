'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar } from 'lucide-react';
import { getReportesDiarios } from '@/lib/actions/app.actions';
import type { ReporteDiario } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function SubcontrataPartesValidadosPage() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <h1 className="text-3xl font-bold font-headline text-primary mb-4">Partes a Validar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Partes Enviados por Encargados</CardTitle>
          <CardDescription>Revisa los reportes diarios recibidos y listos para tu validación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div className="text-center p-8"><Loader2 className="animate-spin mx-auto" /></div>}
          {!loading && reportes.length > 0 ? (
            reportes.map(reporte => (
              <Card key={reporte.id} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <p className="font-bold text-lg">{reporte.proyectoId.replace('proy-', '').replace('-', ' ')}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>{format(new Date(reporte.fecha), "PPPP", { locale: es })}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={reporte.validacion.subcontrata.validado ? "default" : "secondary"} className={reporte.validacion.subcontrata.validado ? "bg-green-600" : ""}>
                      {reporte.validacion.subcontrata.validado ? "Validado por ti" : "Pendiente de tu Validación"}
                    </Badge>
                    <Button disabled={reporte.validacion.subcontrata.validado}>Validar</Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            !loading && <p className="text-muted-foreground text-center py-4">No hay partes pendientes de validación.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
