'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getProyectosBySubcontrata, getTrabajadoresByProyecto, getSubcontratas, saveAttendanceRecord } from '@/lib/actions/app.actions';
import type { Proyecto, Trabajador } from '@/lib/types';
import { Loader2, User, Save, ClipboardCheck, HardHat } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrabajadorConAsistencia extends Trabajador {
  asistencia: boolean;
}

export default function AsistenciaPage() {
  const { toast } = useToast();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [trabajadores, setTrabajadores] = useState<TrabajadorConAsistencia[]>([]);
  
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');
  
  const [isLoadingProyectos, setIsLoadingProyectos] = useState(true);
  const [isLoadingTrabajadores, setIsLoadingTrabajadores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trabajadoresCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProyectos = async () => {
      setIsLoadingProyectos(true);
      // For the mock, we'll fetch all projects from all subcontratas
      const subs = await getSubcontratas();
      const proyPromises = subs.map(s => getProyectosBySubcontrata(s.id));
      const proyArrays = await Promise.all(proyPromises);
      const allProyectos = proyArrays.flat();
      setProyectos(allProyectos);
      setIsLoadingProyectos(false);
    };
    fetchProyectos();
  }, []);

  useEffect(() => {
    if (selectedProyecto && trabajadoresCardRef.current) {
        setTimeout(() => {
            trabajadoresCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
    }
  }, [selectedProyecto]);

  const handleSelectProyecto = async (proyectoId: string) => {
    setSelectedProyecto(proyectoId);
    setTrabajadores([]);
    if (!proyectoId) return;
    setIsLoadingTrabajadores(true);
    const data = await getTrabajadoresByProyecto(proyectoId);
    const trabajadoresConAsistencia = data.map(t => ({ ...t, asistencia: false }));
    setTrabajadores(trabajadoresConAsistencia);
    setIsLoadingTrabajadores(false);
  };

  const handleClearSelection = () => {
    setSelectedProyecto('');
    setTrabajadores([]);
  };

  const getSelectedProyectoName = () => {
    return proyectos.find(p => p.id === selectedProyecto)?.nombre || '';
  };

  const handleAsistenciaChange = (trabajadorId: string, checked: boolean) => {
    setTrabajadores(prev =>
      prev.map(t =>
        t.id === trabajadorId ? { ...t, asistencia: checked } : t
      )
    );
  };

  const handleSaveAttendance = async () => {
    const currentUserId = localStorage.getItem('encargadoId_obra_link');
    if (!selectedProyecto || !currentUserId) {
        toast({ title: "Error", description: "Falta seleccionar un proyecto o no se pudo identificar al encargado.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    
    const attendedWorkers = trabajadores.filter(t => t.asistencia).map(t => t.id);

    const result = await saveAttendanceRecord(selectedProyecto, currentUserId, attendedWorkers);
    if(result.success) {
        toast({ title: "Éxito", description: result.message });
        handleClearSelection();
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Control de Asistencia Diario</h1>
        <p className="text-muted-foreground mt-1">
          Registra la asistencia para hoy, {format(new Date(), 'PPPP', { locale: es })}.
        </p>
      </div>

      <Card className="animate-fade-in-up transition-all duration-300">
        { selectedProyecto ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">1</div>
                    <HardHat className="h-5 w-5 text-primary" />
                    <p className="text-md font-semibold">{getSelectedProyectoName()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearSelection}>Cambiar</Button>
            </div>
        ) : (
            <>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</div>
                        <span>Selecciona el Proyecto</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingProyectos ? (
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proyectos.map(p => (
                        <Button
                            key={p.id}
                            variant={'outline'}
                            className="h-20 text-lg justify-start p-4"
                            onClick={() => handleSelectProyecto(p.id)}
                        >
                            <HardHat className="mr-4 h-6 w-6"/> {p.nombre}
                        </Button>
                        ))}
                    </div>
                )}
                </CardContent>
            </>
        )}
      </Card>

      {selectedProyecto && (
         <Card ref={trabajadoresCardRef} className="animate-fade-in-up">
           <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-lg">2</div>
                <span>Registrar Asistencia en "{getSelectedProyectoName()}"</span>
            </CardTitle>
            <CardDescription>Activa el interruptor para los trabajadores que han asistido hoy.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTrabajadores ? (
              <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>
            ) : (
              trabajadores.length > 0 ? (
                <div className="space-y-4">
                  {trabajadores.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <Label htmlFor={`asistencia-${t.id}`} className="text-lg font-medium flex items-center gap-3 cursor-pointer">
                          <User className="h-5 w-5 text-muted-foreground"/>
                          {t.nombre}
                      </Label>
                      <div className="flex items-center gap-4">
                        <Label htmlFor={`asistencia-${t.id}`} className="text-md font-medium cursor-pointer text-muted-foreground">
                            {t.asistencia ? 'Presente' : 'Ausente'}
                        </Label>
                        <Switch
                            id={`asistencia-${t.id}`}
                            checked={t.asistencia}
                            onCheckedChange={(checked) => handleAsistenciaChange(t.id, checked)}
                            className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAttendance} disabled={isSubmitting} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <Save className="mr-2 h-5 w-5"/>}
                      Guardar Asistencia
                    </Button>
                  </div>
                </div>
              ) : (
                 <p className="text-muted-foreground text-center py-4">No hay trabajadores asignados a este proyecto.</p>
              )
            )}
          </CardContent>
         </Card>
      )}
    </div>
  );
}
