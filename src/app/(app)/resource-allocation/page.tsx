
// src/app/(app)/resource-allocation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cpu, Wand2, AlertTriangle, Info } from 'lucide-react';
import { analyzeResourceAllocation, type AnalyzeResourceAllocationInput, type AnalyzeResourceAllocationOutput } from '@/ai/flows/resource-allocation';
import { getPartesByEmpresaYObra } from '@/lib/actions/parte.actions';
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import { getUsuariosByEmpresaId } from '@/lib/actions/user.actions';
import type { Parte, Obra, UsuarioFirebase } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea'; // For displaying processed data

interface ProcessedParteForAI {
  id: string;
  obraId: string;
  proyectoNombre: string;
  tareaPrincipal: string;
  trabajadorAsignado: string;
  horasEstimadas: number; // Placeholder
  horasRealizadas: number;
  estado: string; // 'Pendiente' or 'Validado'
}

export default function ResourceAllocationPage() {
  const { toast } = useToast();
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResourceAllocationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processedPartesForAI, setProcessedPartesForAI] = useState<ProcessedParteForAI[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (storedEmpresaId) {
      setEmpresaId(storedEmpresaId);
    } else {
      toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
      setError("ID de empresa no disponible para cargar datos.");
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!empresaId) return;

    const fetchDataForAI = async () => {
      setIsLoadingData(true);
      setError(null);
      setAnalysisResult(null);
      try {
        const [fetchedPartes, fetchedObras, fetchedUsuarios] = await Promise.all([
          getPartesByEmpresaYObra(empresaId, 'all'),
          getObrasByEmpresaId(empresaId),
          getUsuariosByEmpresaId(empresaId),
        ]);

        const obrasMap: Record<string, Obra> = fetchedObras.reduce((acc, obra) => {
          acc[obra.id] = obra;
          return acc;
        }, {} as Record<string, Obra>);

        const usuariosMap: Record<string, UsuarioFirebase> = fetchedUsuarios.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, UsuarioFirebase>);

        const pendingPartes = fetchedPartes.filter(p => !p.validado);

        const transformedData = pendingPartes.map(parte => ({
          id: parte.id,
          obraId: parte.obraId,
          proyectoNombre: obrasMap[parte.obraId]?.nombre || 'Proyecto Desconocido',
          tareaPrincipal: parte.tareasRealizadas.substring(0, 150) + (parte.tareasRealizadas.length > 150 ? '...' : ''),
          trabajadorAsignado: usuariosMap[parte.usuarioId]?.nombre || 'Trabajador Desconocido',
          horasEstimadas: 8, // Placeholder standard day
          horasRealizadas: parte.horasTrabajadas || 0,
          estado: 'Pendiente', // Since we filtered for !p.validado
        }));
        
        setProcessedPartesForAI(transformedData);

        if (transformedData.length === 0) {
          toast({
            title: 'No Hay Datos Para Analizar',
            description: 'No se encontraron partes de trabajo pendientes en tu empresa.',
            variant: 'default',
          });
        }

      } catch (e: any) {
        console.error("Error fetching data for AI:", e);
        setError("No se pudieron cargar los datos para el análisis. Inténtalo de nuevo.");
        toast({
          title: 'Error al Cargar Datos',
          description: "No se pudieron obtener los partes de trabajo.",
          variant: 'destructive',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDataForAI();
  }, [empresaId, toast]);

  const handleAnalysis = async () => {
    if (processedPartesForAI.length === 0) {
      toast({
        title: 'Sin Datos',
        description: 'No hay partes pendientes para analizar.',
        variant: 'default',
      });
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const input: AnalyzeResourceAllocationInput = {
        partesData: JSON.stringify(processedPartesForAI),
      };
      const result = await analyzeResourceAllocation(input);
      setAnalysisResult(result);
      toast({
        title: 'Análisis Completado',
        description: 'La IA ha generado una sugerencia de asignación de recursos.',
      });
    } catch (e: any) {
      console.error("Error during AI analysis:", e);
      let errorMessage = 'No se pudo completar el análisis. Inténtalo de nuevo.';
      if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({
        title: 'Error en el Análisis',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <Cpu className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Optimización de Recursos con IA</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Analiza los partes de trabajo pendientes para obtener recomendaciones sobre la asignación de recursos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isLoadingData && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando datos de partes pendientes...</p>
            </div>
          )}

          {!isLoadingData && processedPartesForAI.length === 0 && !error && (
            <Card className="bg-secondary/30 border-secondary p-4">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-md flex items-center">
                  <Info className="mr-2 h-5 w-5 text-primary" />
                  No Hay Partes Para Analizar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm">
                Actualmente no hay partes de trabajo pendientes de validación en tu empresa. La IA necesita esta información para generar sugerencias.
              </CardContent>
            </Card>
          )}
          
          {!isLoadingData && processedPartesForAI.length > 0 && (
             <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    Se analizarán {processedPartesForAI.length} parte(s) de trabajo pendientes.
                </p>
                 {/* Optionally display the data being sent to AI - good for debugging */}
                <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-primary">Ver datos que se enviarán a la IA</summary>
                    <Textarea
                        readOnly
                        value={JSON.stringify(processedPartesForAI, null, 2)}
                        rows={8}
                        className="mt-1 font-mono text-xs bg-muted/20 border-dashed"
                    />
                </details>
            </div>
          )}


          <Button 
            onClick={handleAnalysis} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6" 
            disabled={isLoadingAnalysis || isLoadingData || processedPartesForAI.length === 0}
          >
            {isLoadingAnalysis ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isLoadingAnalysis ? 'Analizando Recursos...' : (isLoadingData ? 'Cargando datos...' : 'Ejecutar Análisis IA')}
          </Button>

          {error && !isLoadingAnalysis && ( // Show general error if not analysis specific
            <Card className="bg-destructive/10 border-destructive text-destructive p-4 animate-fade-in-up">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-md flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm">
                {error}
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card className="bg-secondary/30 border-secondary mt-6 animate-fade-in-up animation-delay-200">
              <CardHeader>
                <CardTitle className="text-xl font-headline text-primary">Resultados del Análisis IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary/90 mb-1">Sugerencia de Asignación:</h3>
                  <p className="text-foreground/80 whitespace-pre-wrap p-3 bg-background rounded-md border border-border">
                    {analysisResult.resourceAllocationSuggestion}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary/90 mb-1">Razonamiento:</h3>
                  <p className="text-foreground/80 whitespace-pre-wrap p-3 bg-background rounded-md border border-border">
                    {analysisResult.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
         <CardFooter className="p-6 text-center">
          <p className="text-xs text-muted-foreground">
            La IA analiza los datos de partes pendientes para ofrecer recomendaciones. Revisa siempre las sugerencias antes de tomar decisiones.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}


    