'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getProyectosBySubcontrata, getTrabajadoresByProyecto, saveAttendanceRecord, getSubcontratas } from '@/lib/actions/app.actions';
import type { Proyecto, Trabajador, Subcontrata } from '@/lib/types';
import { Loader2, User, Check, ListTodo, Save, ClipboardCheck } from 'lucide-react';
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
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  const selectedProyectoNombre = proyectos.find(p => p.id === selectedProyecto)?.nombre || '';

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Control de Asistencia Diario</h1>
        <p className="text-muted-foreground mt-1">
          Selecciona un proyecto y registra la asistencia para hoy, {format(new Date(), 'PPPP', { locale: es })}.
        </p>
      </div>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
             <ListTodo className="h-6 w-6 text-primary"/>
             <span>Paso 1: Selecciona el Proyecto</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProyectos ? (
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          ) : (
            <Select onValueChange={handleSelectProyecto} value={selectedProyecto}>
              <SelectTrigger className="w-full md:w-1/2 text-lg h-12">
                <SelectValue placeholder="Elige un proyecto..." />
              </SelectTrigger>
              <SelectContent>
                {proyectos.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-lg">
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedProyecto && (
         <Card className="animate-fade-in-up">
           <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-accent"/>
                <span>Paso 2: Registrar Asistencia en "{selectedProyectoNombre}"</span>
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
