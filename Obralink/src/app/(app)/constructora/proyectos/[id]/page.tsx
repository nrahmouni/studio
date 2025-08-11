
// src/app/(app)/constructora/proyectos/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Calendar, Building, User, HardHat, UserCheck, MapPin, Briefcase } from 'lucide-react';
import { getProyectoById, getSubcontratas, getTrabajadoresByProyecto } from '@/lib/actions/app.actions';
import type { Proyecto, Subcontrata, Trabajador } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ProyectoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } = useToast();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [subcontrata, setSubcontrata] = useState<Subcontrata | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const proyectoData = await getProyectoById(projectId);
        if (!proyectoData) {
          toast({ title: "Error", description: "Proyecto no encontrado.", variant: "destructive" });
          router.push('/constructora/proyectos');
          return;
        }
        setProyecto(proyectoData);

        const [subcontratasData, trabajadoresData] = await Promise.all([
          getSubcontratas(),
          getTrabajadoresByProyecto(projectId),
        ]);

        const subData = subcontratasData.find(s => s.id === proyectoData.subcontrataId);
        setSubcontrata(subData || null);
        setTrabajadores(trabajadoresData);

      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los detalles del proyecto.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, router, toast]);

  const getStatus = (p: Proyecto) => {
    const now = new Date();
    const fechaFin = p.fechaFin;
    const fechaInicio = p.fechaInicio;

    if (fechaFin && fechaFin < now) return { text: "Finalizado", color: "bg-gray-500" };
    if (fechaInicio && fechaInicio > now) return { text: "Próximamente", color: "bg-blue-500" };
    return { text: "En Curso", color: "bg-green-500" };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  if (!proyecto) {
    return <div className="text-center">Proyecto no encontrado.</div>;
  }
  
  const status = getStatus(proyecto);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-fade-in-down">
         <div>
            <Button variant="outline" onClick={() => router.push('/constructora/proyectos')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado de Proyectos
            </Button>
            <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-3"><Briefcase className="h-8 w-8"/> {proyecto.nombre}</h1>
         </div>
        <Link href={`/constructora/proyectos/${proyecto.id}/edit`} passHref>
          <Button size="lg">
            <Edit className="mr-2 h-5 w-5" /> Modificar Proyecto
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in-up">
          <CardHeader>
            <CardTitle>Detalles del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-md">
            <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Dirección:</span> {proyecto.direccion}</div></div>
            <div className="flex items-center gap-3"><UserCheck className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Cliente Final:</span> {proyecto.clienteNombre || 'No especificado'}</div></div>
            <div className="flex items-center gap-3"><Building className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Subcontrata Asignada:</span> {subcontrata?.nombre || 'N/A'}</div></div>
            <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-muted-foreground"/> 
                <div>
                    <span className="font-semibold">Fechas:</span> {proyecto.fechaInicio ? format(proyecto.fechaInicio, 'd MMM yyyy', {locale: es}) : 'N/A'} - {proyecto.fechaFin ? format(proyecto.fechaFin, 'd MMM yyyy', {locale: es}) : 'Indefinido'}
                </div>
            </div>
             <div className="flex items-center gap-3"><HardHat className="h-5 w-5 text-muted-foreground"/> <div><span className="font-semibold">Estado:</span> <Badge style={{backgroundColor: status.color}} className="text-white ml-2 text-md">{status.text}</Badge></div></div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animation-delay-200">
          <CardHeader>
            <CardTitle>Recursos Asignados</CardTitle>
            <CardDescription>Personal asignado por la subcontrata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
             {trabajadores.length > 0 ? (
              trabajadores.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50 border">
                    <User className="h-5 w-5 text-primary"/>
                    <span>{t.nombre}</span>
                </div>
              ))
             ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay personal asignado a este proyecto todavía.</p>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
