
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building, HardHat, FileText, CheckCircle, Clock, BarChart3, Users, AlertCircle, Briefcase } from 'lucide-react';
import type { Proyecto, ReporteDiario } from '@/lib/types';
import { getProyectosByConstructora, getReportesDiarios } from '@/lib/actions/app.actions';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description: string, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="h-10 w-24 bg-muted animate-pulse rounded-md"></div>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default function ConstructoraDashboardPage() {
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [reportes, setReportes] = useState<ReporteDiario[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const constructoraId = localStorage.getItem('constructoraId_obra_link');
            if (!constructoraId) {
                toast({ title: "Error", description: "No se pudo identificar la constructora.", variant: "destructive" });
                setLoading(false);
                return;
            }
            try {
                const [proyectosData, reportesData] = await Promise.all([
                    getProyectosByConstructora(constructoraId),
                    getReportesDiarios(), // In a real app, this would be filtered by constructoraId
                ]);
                setProyectos(proyectosData);
                setReportes(reportesData);
            } catch (error) {
                toast({ title: "Error", description: "No se pudieron cargar los datos del panel.", variant: "destructive" });
            }
            setLoading(false);
        };
        fetchData();
    }, [toast]);

    const proyectosActivos = proyectos.filter(p => {
        const now = new Date();
        const fechaInicio = p.fechaInicio ? parseISO(p.fechaInicio) : null;
        const fechaFin = p.fechaFin ? parseISO(p.fechaFin) : null;
        return fechaInicio && fechaInicio <= now && (!fechaFin || fechaFin >= now);
    }).length;

    const reportesPendientes = reportes.filter(r => !r.validacion.constructora.validado).length;

    const reportesRecientes = reportes
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
        
    return (
        <div className="space-y-6">
            <div className="animate-fade-in-down">
                <h1 className="text-3xl font-bold font-headline text-primary">Panel de Constructora</h1>
                <p className="text-muted-foreground mt-1">Resumen general de la actividad de tus proyectos.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
               <StatCard 
                    title="Total Proyectos"
                    value={proyectos.length}
                    icon={Building}
                    description="Todos los proyectos registrados"
                    isLoading={loading}
               />
                <StatCard 
                    title="Proyectos Activos"
                    value={proyectosActivos}
                    icon={HardHat}
                    description="Proyectos actualmente en curso"
                    isLoading={loading}
               />
                <StatCard 
                    title="Reportes Totales"
                    value={reportes.length}
                    icon={FileText}
                    description="Partes recibidos de subcontratas"
                    isLoading={loading}
               />
                <StatCard 
                    title="Pendientes de Validar"
                    value={reportesPendientes}
                    icon={AlertCircle}
                    description="Partes que requieren tu aprobación"
                    isLoading={loading}
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 animate-fade-in-up animation-delay-200">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>Últimos partes recibidos de las subcontratas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md"></div>)}
                            </div>
                        ) : reportesRecientes.length > 0 ? (
                           <ul className="space-y-4">
                               {reportesRecientes.map(r => (
                                   <li key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                                       <div className="flex items-center gap-3">
                                           {r.validacion.constructora.validado ? <CheckCircle className="h-5 w-5 text-green-500"/> : <Clock className="h-5 w-5 text-yellow-500"/>}
                                           <div>
                                               <p className="font-semibold capitalize">{r.proyectoId.replace('proy-', '').replace(/-/g, ' ')}</p>
                                               <p className="text-sm text-muted-foreground">Reporte del {format(parseISO(r.fecha), 'PPP', {locale: es})}</p>
                                           </div>
                                       </div>
                                       <div className="text-right">
                                           <p className="text-sm font-medium">{formatDistanceToNow(parseISO(r.timestamp), {locale: es, addSuffix: true})}</p>
                                           <Link href="/constructora/partes"><Button variant="link" size="sm" className="h-auto p-0">Ir a validar</Button></Link>
                                       </div>
                                   </li>
                               ))}
                           </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No hay actividad reciente.</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="animate-fade-in-up animation-delay-400">
                    <CardHeader>
                        <CardTitle>Accesos Directos</CardTitle>
                        <CardDescription>Navega a las secciones principales.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Link href="/constructora/proyectos" passHref><Button className="w-full justify-start text-base py-6" variant="outline"><Briefcase className="mr-3"/>Gestionar Proyectos</Button></Link>
                        <Link href="/constructora/partes" passHref><Button className="w-full justify-start text-base py-6" variant="outline"><Users className="mr-3"/>Seguimiento de Partes</Button></Link>
                        <Link href="/constructora/analisis-recursos" passHref><Button className="w-full justify-start text-base py-6" variant="outline"><BarChart3 className="mr-3"/>Análisis de Recursos (IA)</Button></Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
