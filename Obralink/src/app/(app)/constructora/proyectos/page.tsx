
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Briefcase, Building, Calendar } from 'lucide-react';
import { getProyectosByConstructora, getSubcontratas } from '@/lib/actions/app.actions';
import type { Proyecto, Subcontrata } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddProyectoDialog } from '@/components/dashboards/AddProyectoDialog';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function GestionProyectosConstructoraPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [subcontratas, setSubcontratas] = useState<Subcontrata[]>([]);
  const [subcontratasMap, setSubcontratasMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const constructoraId = localStorage.getItem('constructoraId_obra_link');
    if (!constructoraId) {
      toast({ title: "Error", description: "No se pudo identificar la constructora.", variant: "destructive" });
      setLoading(false);
      return;
    }
    const [proyectosData, subcontratasData] = await Promise.all([
      getProyectosByConstructora(constructoraId),
      getSubcontratas(),
    ]);
    
    proyectosData.sort((a,b) => {
        const dateA = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
        const dateB = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
        return dateB - dateA;
    });
    setProyectos(proyectosData);
    setSubcontratas(subcontratasData);

    const subMap = subcontratasData.reduce((acc, s) => ({...acc, [s.id]: s.nombre}), {});
    setSubcontratasMap(subMap);
    
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onProyectoAdded = useCallback((newProyecto: Proyecto) => {
    setProyectos(prev => {
        const newProyectos = [newProyecto, ...prev];
        newProyectos.sort((a,b) => {
             const dateA = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
             const dateB = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
             return dateB - dateA;
        });
        return newProyectos;
    });
  }, []);

  const getStatus = (proyecto: Proyecto) => {
    const now = new Date();
    const fechaFin = proyecto.fechaFin ? new Date(proyecto.fechaFin) : null;
    const fechaInicio = proyecto.fechaInicio ? new Date(proyecto.fechaInicio) : null;
    if (fechaFin && fechaFin < now) return { text: "Finalizado", color: "bg-gray-500" };
    if (fechaInicio && fechaInicio > now) return { text: "Próximamente", color: "bg-blue-500" };
    return { text: "En Curso", color: "bg-green-500" };
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fade-in-down">
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary">Panel de Proyectos</h1>
            <p className="text-muted-foreground mt-1">Crea, visualiza y gestiona todos los proyectos de tu constructora.</p>
        </div>
        <AddProyectoDialog onProyectoAdded={onProyectoAdded} subcontratas={subcontratas}>
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-5 w-5"/> Añadir Nuevo Proyecto
            </Button>
        </AddProyectoDialog>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle>Listado de Proyectos</CardTitle>
          <CardDescription>Aquí se muestran todos los proyectos de tu constructora. Haz clic en "Gestionar" para ver los detalles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {proyectos.length > 0 ? proyectos.map(p => {
            const status = getStatus(p);
            return (
              <Card key={p.id} className="p-4 hover:shadow-md transition-shadow bg-card hover:bg-muted/50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div className="flex items-center gap-4">
                    <Briefcase className="h-8 w-8 text-accent hidden sm:block"/>
                    <div>
                        <p className="font-bold text-lg">{p.nombre}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 capitalize"><Building className="h-4 w-4"/>
                          Subcontrata: <span className="font-semibold text-foreground">{subcontratasMap[p.subcontrataId] || 'No asignada'}</span>
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                           <Calendar className="h-4 w-4"/>
                           {p.fechaInicio ? format(new Date(p.fechaInicio), 'd MMM yyyy', {locale: es}) : 'N/A'} - {p.fechaFin ? format(new Date(p.fechaFin), 'd MMM yyyy', {locale: es}) : 'Indefinido'}
                        </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-start">
                    <Badge style={{backgroundColor: status.color}} className="text-white">{status.text}</Badge>
                    <Link href={`/constructora/proyectos/${p.id}`} passHref>
                        <Button variant="outline" size="sm">Gestionar</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}) : (
            <p className="text-center py-6 text-muted-foreground">No tienes proyectos creados todavía.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
