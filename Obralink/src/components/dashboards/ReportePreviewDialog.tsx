
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReporteDiario } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User, Check, X, Clock, MessageSquare } from "lucide-react";

interface ReportePreviewDialogProps {
  reporte: ReporteDiario | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportePreviewDialog({ reporte, isOpen, onOpenChange }: ReportePreviewDialogProps) {
  if (!reporte) return null;

  const proyectoNombre = reporte.proyectoId.replace('proy-', '').replace(/-/g, ' ');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary">
            Previsualización del Reporte
          </DialogTitle>
          <DialogDescription>
            Detalles del reporte diario para el proyecto: <span className="font-semibold">{proyectoNombre}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> <strong>Fecha del Reporte:</strong> {format(parseISO(reporte.fecha), "PPPP", { locale: es })}</p>
            <p className="flex items-center gap-2"><User className="h-4 w-4" /> <strong>Reportado por (ID):</strong> {reporte.encargadoId}</p>
          </div>
          
          <h3 className="font-semibold text-lg">Resumen de Personal</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajador</TableHead>
                  <TableHead className="text-center">Asistencia</TableHead>
                  <TableHead className="text-right">Horas Reportadas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporte.trabajadores.map(trabajador => (
                  <TableRow key={trabajador.trabajadorId}>
                    <TableCell className="font-medium">{trabajador.nombre}</TableCell>
                    <TableCell className="text-center">
                      {trabajador.asistencia ? (
                        <span className="inline-flex items-center gap-1 text-green-600"><Check className="h-5 w-5" /> Sí</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600"><X className="h-5 w-5" /> No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono flex items-center justify-end gap-1">
                       <Clock className="h-4 w-4 text-muted-foreground"/> {trabajador.asistencia ? `${trabajador.horas}h` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {reporte.comentarios && (
            <div className="pt-2">
                <h3 className="font-semibold text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5"/>Comentarios Adicionales</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md mt-2 border">{reporte.comentarios}</p>
            </div>
          )}

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
