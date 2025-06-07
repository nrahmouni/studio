// src/app/(app)/reports/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Informes y Estadísticas
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
           <CardTitle className="flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-primary" />
            <span>Centro de Informes</span>
          </CardTitle>
          <CardDescription>
            Visualiza el rendimiento de tus proyectos y la eficiencia de tu equipo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <Construction className="mx-auto h-16 w-16 mb-6 text-accent animate-pulse" />
            <p className="text-2xl font-semibold mb-3 text-primary">¡Estamos Construyendo Algo Genial!</p>
            <p className="text-lg mb-2">La sección de informes está actualmente en desarrollo.</p>
            <p>Próximamente podrás generar informes detallados sobre costes, tiempos, productividad y mucho más.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
