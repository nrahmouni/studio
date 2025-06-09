
// src/app/(app)/reports/page.tsx
'use client'; 

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Loader2, AlertTriangle, Info } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import { getPartesByEmpresaYObra } from '@/lib/actions/parte.actions';
import type { Obra, Parte } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  obraName: string;
  partesCount: number;
}

const chartConfig = {
  partesCount: {
    label: "Nº de Partes",
    color: "hsl(var(--chart-1))",
  },
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    if (storedEmpresaId) {
      setEmpresaId(storedEmpresaId);
    } else {
      toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
      setError("ID de empresa no disponible para cargar informes.");
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!empresaId) return;

    const fetchReportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedObras, fetchedPartes] = await Promise.all([
          getObrasByEmpresaId(empresaId),
          getPartesByEmpresaYObra(empresaId, 'all') // Fetch all partes for the company
        ]);

        if (fetchedObras.length === 0) {
          setReportData([]);
          setIsLoading(false);
          return;
        }

        const data: ReportData[] = fetchedObras.map(obra => {
          const count = fetchedPartes.filter(parte => parte.obraId === obra.id).length;
          return {
            obraName: obra.nombre.length > 20 ? obra.nombre.substring(0, 17) + '...' : obra.nombre, // Truncate long names for chart
            partesCount: count,
          };
        });
        
        // Filter out obras with 0 partes if you only want to show active ones, or sort them
        setReportData(data.sort((a,b) => b.partesCount - a.partesCount));

      } catch (e: any) {
        console.error("Error fetching report data:", e);
        setError("No se pudieron cargar los datos para los informes. Inténtalo de nuevo.");
        toast({
          title: 'Error al Cargar Datos del Informe',
          description: e.message || "No se pudieron obtener los datos necesarios.",
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [empresaId, toast]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Informes para Gestión y Validación
        </h1>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Cargando datos del informe...</p>
        </div>
      )}

      {error && !isLoading && (
         <Card className="bg-destructive/10 border-destructive text-destructive animate-fade-in-up">
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      )}

      {!isLoading && !error && reportData.length === 0 && (
         <Card className="shadow-lg animate-fade-in-up">
          <CardHeader className="items-center text-center">
            <Info className="mx-auto h-12 w-12 text-primary mb-3" />
            <CardTitle>No Hay Datos Para Mostrar</CardTitle>
            <CardDescription>No se encontraron obras o partes de trabajo para generar el informe.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && reportData.length > 0 && (
        <Card className="shadow-lg mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-3 h-6 w-6 text-primary" />
              <span>Número de Partes de Trabajo por Obra</span>
            </CardTitle>
            <CardDescription>
              Resumen de actividad para revisión y validación mensual por Jefes de Obra.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[350px] w-full aspect-video">
                  <BarChart 
                    accessibilityLayer 
                    data={reportData}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid horizontal={false} vertical={true} strokeDasharray="3 3" />
                    <YAxis
                      dataKey="obraName"
                      type="category"
                      tickLine={false}
                      tickMargin={5}
                      axisLine={false}
                      width={120}
                      className="text-xs"
                    />
                    <XAxis dataKey="partesCount" type="number" axisLine={false} tickLine={false} tickMargin={5} />
                    <ChartTooltip 
                        cursor={{fill: 'hsl(var(--muted))', radius: 4}}
                        content={<ChartTooltipContent indicator="dot" />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="partesCount" fill="var(--color-partesCount)" radius={5} barSize={30}>
                        <LabelList dataKey="partesCount" position="right" offset={8} className="fill-foreground text-xs" />
                    </Bar>
                  </BarChart>
              </ChartContainer>
          </CardContent>
          <CardFooter className="p-4 border-t text-center bg-primary/5">
            <p className="text-xs text-muted-foreground mx-auto">
                Esta información es clave para la revisión y validación mensual del progreso por parte de la Jefatura de Obra, permitiendo una toma de decisiones informada.
            </p>
         </CardFooter>
        </Card>
      )}
      
       <div className="mt-12 text-center text-muted-foreground animate-fade-in-up animation-delay-700">
          <BarChart3 className="mx-auto h-10 w-10 mb-3" />
          <p>Más informes detallados y opciones de personalización estarán disponibles en futuras actualizaciones.</p>
        </div>
    </div>
  );
}
