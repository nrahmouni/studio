
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getReporteDiarioById, getTrabajadoresByProyecto, updateDailyReport } from '@/lib/actions/app.actions';
import type { ReporteTrabajador, Trabajador } from '@/lib/types';
import { Loader2, Save, User, Plus, Minus, ArrowLeft, AlertTriangle } from 'lucide-react';

interface TrabajadorConEstado extends Trabajador {
  asistencia: boolean;
  horas: number;
}

export default function ModificarAsistenciaPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const reporteId = params.id as string;

  const [trabajadores, setTrabajadores] = useState([]);
  const [proyectoNombre, setProyectoNombre] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reporteId) return;

    const fetchReporteData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const reporte = await getReporteDiarioById(reporteId);

        if (!reporte) {
          setError("Reporte no encontrado.");
          setIsLoading(false);
          return;
        }
        
        if (reporte.validacion.subcontrata.validado || reporte.validacion.constructora.validado) {
          setError("Este reporte ya ha sido validado por la subcontrata o constructora y no puede ser modificado.");
          setIsLoading(false);
          return;
        }

        setProyectoNombre(reporte.proyectoId.replace('proy-', '').replace(/-/g, ' '));
        
        const todosTrabajadores = await getTrabajadoresByProyecto(reporte.proyectoId);
        const trabajadoresConEstado = todosTrabajadores.map(t => {
          const reporteTrabajador = reporte.trabajadores.find(rt => rt.trabajadorId === t.id);
          return {
            ...t,
            asistencia: reporteTrabajador?.asistencia ?? false,
            horas: reporteTrabajador?.horas ?? 8,
          };
        });
        setTrabajadores(trabajadoresConEstado);
      } catch (e) {
          setError("Ocurrió un error al cargar los datos del reporte.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReporteData();
  }, [reporteId]);

  const handleTrabajadorChange = (trabajadorId, field, value) => {
    setTrabajadores(prev =>
      prev.map(t =>
        t.id === trabajadorId ? { ...t, [field]: value } : t
      )
    );
  };
  
  const handleSaveChanges = async () => {
    if (!reporteId) {
        toast({ title: "Error", description: "ID de reporte no encontrado.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    
    const reporteActualizado = trabajadores
      .filter(t => t.asistencia)
      .map(t => ({
        trabajadorId: t.id,
        nombre: t.nombre,
        asistencia: true,
        horas: t.horas,
      }));

    if (reporteActualizado.length === 0) {
      toast({
        title: "Atención",
        description: "No se puede guardar un reporte si no ha asistido ningún trabajador.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const result = await updateDailyReport(reporteId, reporteActualizado);
    if(result.success) {
        toast({ title: "Éxito", description: "El registro de asistencia se ha actualizado correctamente." });
        router.push('/encargado/asistencia');
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return ;
  }

  if (error) {
     return (
        
            
                
                    
                      Error de Modificación
                    
                    {error}
                
                
                     Volver
                    
                
            
        
     );
  }

  return (
    
       
        
             Volver
        
            Modificar Asistencia
            Estás editando el registro de asistencia para el proyecto: {proyectoNombre}
          
       

        
          
            
              Valida la Asistencia y Horas
            
            Ajusta la asistencia y las horas de cada trabajador y guarda los cambios.
          
          
            {trabajadores.map(t => (
              
                
                  
                      
                      {t.nombre}
                  
                  
                      
                          
                              
                                
                              
                              Asiste
                          
                      
                      
                          
                              
                          
                          
                              {t.asistencia ? `${t.horas}h` : '--'}
                          
                          
                              
                          
                      
                  
                
              
            ))}
            
                
                    
                        Cancelar
                    
                    
                        
                            
                        
                        Guardar Cambios
                    
                
            
          
        
    
  );
}
