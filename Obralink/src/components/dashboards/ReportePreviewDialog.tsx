
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
    
      
        
          
            Previsualización del Reporte
          
            Detalles del reporte diario para el proyecto: {proyectoNombre}
          
        
        
           {proyectoNombre}
           {reporte.encargadoId}
          
          
            Resumen de Personal
          
          
            
              
                Trabajador
                
                Asistencia
                
                Horas Reportadas
              
              
                {reporte.trabajadores.map(trabajador => (
                  
                    {trabajador.nombre}
                    
                      {trabajador.asistencia ?  Sí :  No}
                    
                    
                      {trabajador.asistencia ? `${trabajador.horas}h` : 'N/A'}
                    
                  
                ))}
              
            
          

          {reporte.comentarios && (
            
                
                   Comentarios Adicionales
                
                {reporte.comentarios}
            
          )}

        
        
          
            Cerrar
          
        
      
    
  );
}
