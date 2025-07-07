'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, Loader2, Calendar, HardHat, CheckCircle, Clock } from 'lucide-react';
import type { ReporteDiario, Proyecto } from '@/lib/types';
import { getReportesDiarios, getProyectosBySubcontrata, getSubcontratas } from '@/lib/actions/app.actions';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AsistenciaDashboardPage() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [proyectosMap, setProyectosMap] = useState<Record<string, Proyecto>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      const encargadoId = localStorage.getItem('encargadoId_obra_link');
      if (encargadoId) {
        const data = await getReportesDiarios(undefined, encargadoId);
        setReportes(data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
        
        const subs = await getSubcontratas();
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

  return (
    <div className="space-y-8">
        <div className="animate-fade-in-down">
            <h1 className="text-3xl font-bold font-headline text-primary">Control de Asistencia</h1>
            <p className="text-muted-foreground mt-1">Consulta los registros de asistencia pasados o crea uno nuevo.</p>
        </div>

        <div className="animate-fade-in-up">
            <Link href="/encargado/asistencia/nuevo" passHref>
                <Button size="lg" className="w-full text-lg py-8 bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <PlusCircle className="mr-3 h-6 w-6" />
                    Registrar Nueva Asistencia
                </Button>
            </Link>
        </div>

        <Card className="animate-fade-in-up animation-delay-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary" /> Historial de Asistencias</CardTitle>
                <CardDescription>Estos son los últimos registros de asistencia guardados. Cada registro de asistencia genera un parte diario.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : reportes.length > 0 ? (
                    <div className="space-y-4">
                        {reportes.map(reporte => {
                            const proyecto = proyectosMap[reporte.proyectoId];
                            const attendedCount = reporte.trabajadores.filter(t => t.asistencia).length;
                            const totalCount = reporte.trabajadores.length;

                            return (
                                <div key={reporte.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center bg-card hover:bg-muted/50 transition-colors gap-3">
                                    <div className="flex-1">
                                        <p className="font-bold text-lg flex items-center gap-2 capitalize"><HardHat className="h-5 w-5 text-accent"/>{proyecto?.nombre || 'Proyecto Desconocido'}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>{format(new Date(reporte.fecha), 'PPP', { locale: es })}</p>
                                    </div>
                                    <div className="flex items-center gap-6 self-start sm:self-center">
                                        <div className="text-center">
                                            <p className="font-bold text-xl">{attendedCount}<span className="text-sm font-normal text-muted-foreground">/{totalCount}</span></p>
                                            <p className="text-xs text-muted-foreground">Trabajadores</p>
                                        </div>
                                        {reporte.validacion.subcontrata.validado ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="font-medium">Validado</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-yellow-600">
                                                <Clock className="h-5 w-5" />
                                                <span className="font-medium">Pendiente</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-6">No hay registros de asistencia guardados.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
