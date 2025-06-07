// src/app/(app)/reports/page.tsx
'use client'; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Construction, DollarSign, Clock, Users, FileText } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts" // Removed ResponsiveContainer for now if not used

const mockReportCategories = [
  { title: "Informe de Costes por Obra", icon: DollarSign, description: "Analiza los gastos detallados por cada proyecto.", status: "Próximamente" },
  { title: "Informe de Tiempos y Productividad", icon: Clock, description: "Mide la eficiencia y las horas invertidas por tarea y trabajador.", status: "Próximamente" },
  { title: "Informe de Actividad de Usuarios", icon: Users, description: "Seguimiento de la actividad y partes generados por cada usuario.", status: "Próximamente" },
  { title: "Resumen General de Partes", icon: FileText, description: "Estadísticas globales sobre los partes de trabajo registrados.", status: "Próximamente" },
];

const chartData = [
  { month: "Enero", partes: 186, validados: 80 },
  { month: "Febrero", partes: 305, validados: 200 },
  { month: "Marzo", partes: 237, validados: 120 },
  { month: "Abril", partes: 273, validados: 190 },
  { month: "Mayo", partes: 209, validados: 130 },
  { month: "Junio", partes: 214, validados: 140 },
]

const chartConfig = {
  partes: {
    label: "Partes Registrados",
    color: "hsl(var(--chart-1))",
  },
  validados: {
    label: "Partes Validados",
    color: "hsl(var(--chart-2))",
  },
}


export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Informes y Estadísticas
        </h1>
      </div>

      <Card className="shadow-lg mb-8 animate-fade-in-up">
        <CardHeader>
           <CardTitle className="flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-primary" />
            <span>Centro de Informes</span>
          </CardTitle>
          <CardDescription>
            Visualiza el rendimiento de tus proyectos y la eficiencia de tu equipo.
            <br />
            <span className="text-xs text-accent">Los datos mostrados en los gráficos son ejemplos.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                   <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="partes" fill="var(--color-partes)" radius={4} />
                  <Bar dataKey="validados" fill="var(--color-validados)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReportCategories.map((report, index) => (
          <Card 
            key={index} 
            className={`shadow-md card-interactive animate-fade-in-up animation-delay-${(index + 1) * 150}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <report.icon className="mr-3 h-6 w-6 text-primary" />
                <span>{report.title}</span>
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-accent font-semibold flex items-center">
                <Construction className="mr-2 h-4 w-4 animate-pulse" />
                {report.status}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
       <div className="mt-12 text-center text-muted-foreground animate-fade-in-up animation-delay-800">
          <BarChart3 className="mx-auto h-10 w-10 mb-3" />
          <p>Más informes y opciones de personalización estarán disponibles en futuras actualizaciones.</p>
        </div>
    </div>
  );
}
