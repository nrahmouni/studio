// src/app/(app)/resource-allocation/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Added import
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Cpu, Wand2, AlertTriangle } from 'lucide-react';
import { analyzeResourceAllocation, type AnalyzeResourceAllocationInput, type AnalyzeResourceAllocationOutput } from '@/ai/flows/resource-allocation';

// Mock data similar a lo que se enviaría al flow
const mockPartesData = [
  { id: 'parte-1', obraId: 'obra-A', proyectoNombre: 'Residencia Sol', tareaPrincipal: 'Fontanería general', trabajadorAsignado: 'Juan Pérez', horasEstimadas: 20, horasRealizadas: 5, estado: 'En progreso' },
  { id: 'parte-2', obraId: 'obra-B', proyectoNombre: 'Oficinas Centro', tareaPrincipal: 'Instalación eléctrica', trabajadorAsignado: 'Ana López', horasEstimadas: 40, horasRealizadas: 30, estado: 'Casi finalizado' },
  { id: 'parte-3', obraId: 'obra-A', proyectoNombre: 'Residencia Sol', tareaPrincipal: 'Pintura interior', trabajadorAsignado: 'Carlos Ruiz', horasEstimadas: 30, horasRealizadas: 0, estado: 'Pendiente inicio' },
  { id: 'parte-4', obraId: 'obra-C', proyectoNombre: 'Local Comercial Avenida', tareaPrincipal: 'Albañilería', trabajadorAsignado: 'Sofía Martín', horasEstimadas: 50, horasRealizadas: 10, estado: 'En progreso' },
  { id: 'parte-5', obraId: 'obra-A', proyectoNombre: 'Residencia Sol', tareaPrincipal: 'Carpintería', trabajadorAsignado: 'Juan Pérez', horasEstimadas: 15, horasRealizadas: 10, estado: 'Retrasado' },
];

export default function ResourceAllocationPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResourceAllocationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Para este ejemplo, el input de texto para `partesData` estará pre-rellenado
  // En una app real, este JSON vendría de una base de datos o un estado de la aplicación.
  const [partesJson, setPartesJson] = useState(JSON.stringify(mockPartesData, null, 2));


  const handleAnalysis = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      // Validar que el JSON es parseable antes de enviarlo
      JSON.parse(partesJson);
      
      const input: AnalyzeResourceAllocationInput = {
        partesData: partesJson,
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
      if (e instanceof SyntaxError) {
        errorMessage = 'El formato de los datos de los partes (JSON) no es válido. Por favor, revisa la estructura.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast({
        title: 'Error en el Análisis',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <Cpu className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Optimización de Recursos con IA</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Analiza los partes de trabajo abiertos para obtener recomendaciones sobre la asignación de recursos y evitar cuellos de botella.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <Label htmlFor="partesData" className="font-semibold text-lg mb-2 block">
              Datos de Partes de Trabajo (Formato JSON)
            </Label>
            <Textarea
              id="partesData"
              value={partesJson}
              onChange={(e) => setPartesJson(e.target.value)}
              rows={10}
              className="font-mono text-sm bg-muted/30 border-input focus:border-primary"
              placeholder="Pega aquí el JSON con los datos de los partes de trabajo..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Este es un ejemplo. En una aplicación real, estos datos se cargarían automáticamente.
            </p>
          </div>

          <Button onClick={handleAnalysis} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Analizando Recursos...' : 'Ejecutar Análisis IA'}
          </Button>

          {error && (
            <Card className="bg-destructive/10 border-destructive text-destructive p-4">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-md flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Error en el Análisis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm">
                {error}
              </CardContent>
            </Card>
          )}

          {analysisResult && (
            <Card className="bg-secondary/30 border-secondary mt-6">
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
            La IA analiza los datos proporcionados para ofrecer recomendaciones. Revisa siempre las sugerencias antes de tomar decisiones.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
