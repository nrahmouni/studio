'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, HardHat } from 'lucide-react';
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
                    <Button disabled={reporte.validacion.subcontrata.validado} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">Validar</Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            !loading && <p className="text-muted-foreground text-center py-6">No hay partes pendientes de validación en este momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}