'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReporteDiario } from '@/lib/types';
import { getReportesDiarios } from '@/lib/actions/app.actions';
import { Loader2, FileCheck, Check, X, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function PartesEnviadosPage() {
  const [reportes, setReportes] = useState<ReporteDiario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      const encargadoId = localStorage.getItem('encargadoId_obra_link');
      const data = await getReportesDiarios(undefined, encargadoId || undefined);
      // Sort reports by most recent first
      data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setReportes(data);
      setLoading(false);
    };
    fetchReportes();
  }, []);

  const getValidationStatus = (reporte: ReporteDiario) => {
    if(reporte.validacion.constructora.validado) return {text: "Validado por todos", color: "bg-green-600"};
    if(reporte.validacion.subcontrata.validado) return {text: "Validado por Subcontrata", color: "bg-blue-500"};
    if(reporte.validacion.encargado.validado) return {text: "Enviado por ti", color: "bg-yellow-500 text-black"};
    return {text: "Borrador", color: "bg-gray-400"};
  }

  if (loading) {
    return <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">Historial de Partes Enviados</h1>
        <p className="text-muted-foreground mt-1">Aquí puedes ver un registro detallado de los reportes diarios que has enviado.</p>
      </div>
      
      {reportes.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-3">
          {reportes.map(reporte => {
            const status = getValidationStatus(reporte);
            return (
            <Card key={reporte.id} className="animate-fade-in-up">
              <AccordionItem value={reporte.id} className="border-b-0">
                <AccordionTrigger className="p-4 hover:no-underline text-left">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center w-full gap-2">
                    <div className="flex items-center gap-4">
                      <FileCheck className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold text-lg capitalize">{reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">Fecha: {format(new Date(reporte.fecha), "PPP", { locale: es })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-end sm:self-center pr-2">
                      <Badge style={{backgroundColor: status.color}} className="text-white">{status.text}</Badge>
                      <Badge variant="secondary">{reporte.trabajadores.length} trabajadores</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-md mb-3">Detalle del Reporte:</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead><User className="inline-block h-4 w-4 mr-1"/>Trabajador</TableHead>
                            <TableHead className="text-center">Asistencia</TableHead>
                            <TableHead className="text-right"><Clock className="inline-block h-4 w-4 mr-1"/>Horas Reportadas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reporte.trabajadores.map(trabajador => (
                            <TableRow key={trabajador.trabajadorId}>
                              <TableCell className="font-medium">{trabajador.nombre}</TableCell>
                              <TableCell className="text-center">
                                {trabajador.asistencia ? (
                                  <span className="inline-flex items-center gap-1 text-green-600 font-medium"><Check className="h-5 w-5" /> Presente</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-red-600 font-medium"><X className="h-5 w-5" /> Ausente</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono text-lg">
                                {trabajador.asistencia ? `${trabajador.horas}h` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          )})}
        </Accordion>
      ) : (
        <Card className="animate-fade-in-up">
            <CardContent className="p-8">
                <p className="text-muted-foreground text-center">No has enviado ningún reporte todavía.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
