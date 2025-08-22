
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Lightbulb, FileText, AlertTriangle } from 'lucide-react';
import type { ReporteDiario } from '@/lib/types';
import { getReportesDiarios } from '@/lib/actions/app.actions';
import { useToast } from '@/hooks/use-toast';
import { analyzeResourceAllocation, AnalyzeResourceAllocationOutput } from '@/ai/flows/resource-allocation';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function AnalisisRecursosPage() {
    const [reportes, setReportes] = useState<ReporteDiario[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeResourceAllocationOutput | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchReportes = async () => {
            setLoading(true);
            const allReportes = await getReportesDiarios();
            const openReportes = allReportes.filter(r => !r.validacion.constructora.validado);
            setReportes(openReportes);
            setLoading(false);
        };
        fetchReportes();
    }, []);

    const handleAnalyze = async () => {
        if (reportes.length === 0) {
            toast({
                title: 'No hay datos para analizar',
                description: 'No existen partes de trabajo abiertos para ejecutar el análisis.',
                variant: 'destructive',
            });
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const result = await analyzeResourceAllocation({ partesData: JSON.stringify(reportes) });
            setAnalysisResult(result);
            toast({
                title: 'Análisis Completado',
                description: 'La IA ha generado una sugerencia de asignación de recursos.',
            });
        } catch (error) {
            console.error('Error during AI analysis:', error);
            toast({
                title: 'Error en el Análisis',
                description: 'No se pudo completar el análisis de la IA. Por favor, inténtalo de nuevo.',
                variant: 'destructive',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="animate-fade-in-down">
                <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-3"><Wand2/>Análisis de Recursos con IA</h1>
                <p className="text-muted-foreground mt-1">Utiliza la IA para analizar los partes abiertos y obtener sugerencias para optimizar la asignación de recursos.</p>
            </div>

            <Card className="animate-fade-in-up">
                <CardHeader>
                    <CardTitle>Iniciar Análisis</CardTitle>
                    <CardDescription>
                        La IA procesará {loading ? '...' : reportes.length} partes de trabajo abiertos para identificar posibles cuellos de botella y sugerir mejoras.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing || loading} size="lg" className="w-full">
                        {isAnalyzing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Wand2 className="mr-2 h-5 w-5"/>}
                        {isAnalyzing ? 'Analizando...' : 'Generar Sugerencia de Asignación'}
                    </Button>
                </CardContent>
            </Card>

            {isAnalyzing && (
                 <Card className="animate-fade-in-up">
                    <CardHeader><CardTitle className="flex items-center gap-3 text-primary"><Loader2 className="animate-spin"/>Procesando Información...</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                         <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-32 w-full" />
                    </CardContent>
                </Card>
            )}

            {analysisResult && (
                <Card className="animate-fade-in-up border-accent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-accent"><Lightbulb/>Resultado del Análisis de IA</CardTitle>
                        <CardDescription>Esta es la recomendación generada por la inteligencia artificial.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="suggestion" className="font-semibold text-lg flex items-center gap-2"><FileText/> Sugerencia</Label>
                            <Textarea id="suggestion" readOnly value={analysisResult.resourceAllocationSuggestion} rows={4} className="mt-2 bg-muted/50"/>
                        </div>
                        <div>
                            <Label htmlFor="reasoning" className="font-semibold text-lg flex items-center gap-2"><AlertTriangle/> Razonamiento</Label>
                            <Textarea id="reasoning" readOnly value={analysisResult.reasoning} rows={6} className="mt-2 bg-muted/50"/>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
