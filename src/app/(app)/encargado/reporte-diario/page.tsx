
'use client';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSubcontratas, getProyectosBySubcontrata, getTrabajadoresByProyecto, saveDailyReport } from '@/lib/actions/app.actions';
import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador } from '@/lib/types';
import { Loader2, Send } from 'lucide-react';

interface TrabajadorConEstado extends Trabajador {
  asistencia: boolean;
  horas: number;
}

export default function ReporteDiarioPage() {
  const { toast } = useToast();
  const [subcontratas, setSubcontratas] = useState<Subcontrata[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [trabajadores, setTrabajadores] = useState<TrabajadorConEstado[]>([]);
  
  const [selectedSubcontrata, setSelectedSubcontrata] = useState<string>('');
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');
  
  const [isLoadingSubcontratas, setIsLoadingSubcontratas] = useState(true);
  const [isLoadingProyectos, setIsLoadingProyectos] = useState(false);
  const [isLoadingTrabajadores, setIsLoadingTrabajadores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubcontratas = async () => {
      setIsLoadingSubcontratas(true);
      const data = await getSubcontratas();
      setSubcontratas(data);
      setIsLoadingSubcontratas(false);
    };
    fetchSubcontratas();
  }, []);

  const handleSubcontrataChange = async (subcontrataId: string) => {
    setSelectedSubcontrata(subcontrataId);
    setSelectedProyecto('');
    setProyectos([]);
    setTrabajadores([]);
    setIsLoadingProyectos(true);
    const data = await getProyectosBySubcontrata(subcontrataId);
    setProyectos(data);
    setIsLoadingProyectos(false);
  };

  const handleProyectoChange = async (proyectoId: string) => {
    setSelectedProyecto(proyectoId);
    setTrabajadores([]);
    if (!proyectoId) return;
    setIsLoadingTrabajadores(true);
    const data = await getTrabajadoresByProyecto(proyectoId);
    const trabajadoresConEstado = data.map(t => ({ ...t, asistencia: true, horas: 8 }));
    setTrabajadores(trabajadoresConEstado);
    setIsLoadingTrabajadores(false);
  };

  const handleTrabajadorChange = (trabajadorId: string, field: 'asistencia' | 'horas', value: boolean | number) => {
    setTrabajadores(prev =>
      prev.map(t =>
        t.id === trabajadorId ? { ...t, [field]: value } : t
      )
    );
  };
  
  const handleValidateDay = async () => {
    const currentUserId = localStorage.getItem('encargadoId_obra_link');
    if (!selectedProyecto || !currentUserId) {
        toast({ title: "Error", description: "Falta seleccionar un proyecto o no se pudo identificar al encargado.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    const reporte: ReporteTrabajador[] = trabajadores.map(t => ({
        trabajadorId: t.id,
        nombre: t.nombre,
        asistencia: t.asistencia,
        horas: t.asistencia ? t.horas : 0,
    }));

    const result = await saveDailyReport(selectedProyecto, currentUserId, reporte);
    if(result.success) {
        toast({ title: "Éxito", description: result.message });
        // Reset view
        setSelectedProyecto('');
        setTrabajadores([]);
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline text-primary">Reporte Diario de Obra</h1>
      <Card>
        <CardHeader>
          <CardTitle>Paso 1: Seleccionar Proyecto</CardTitle>
          <CardDescription>Elige la subcontrata y el proyecto para reportar la jornada de hoy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>1. Selecciona Empresa Subcontratada</Label>
              <Select onValueChange={handleSubcontrataChange} disabled={isLoadingSubcontratas} value={selectedSubcontrata}>
                <SelectTrigger>{isLoadingSubcontratas ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null} Selecciona subcontrata...</SelectTrigger>
                <SelectContent>
                  {subcontratas.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>2. Selecciona Proyecto</Label>
              <Select onValueChange={handleProyectoChange} disabled={!selectedSubcontrata || isLoadingProyectos} value={selectedProyecto}>
                <SelectTrigger>{isLoadingProyectos ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null} Selecciona proyecto...</SelectTrigger>
                <SelectContent>
                  {proyectos.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoadingTrabajadores && <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>}

      {trabajadores.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Paso 2: Lista de Trabajadores</CardTitle>
            <CardDescription>Valida la asistencia y las horas para el día de hoy y envía el reporte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 items-center font-semibold border-b pb-2">
                <span>Trabajador</span>
                <span className="text-center">Asistencia</span>
                <span className="text-center">Horas</span>
            </div>
            {trabajadores.map(t => (
              <div key={t.id} className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 items-center p-2 rounded-md hover:bg-muted/50">
                <Label htmlFor={`asistencia-${t.id}`}>{t.nombre}</Label>
                <div className="text-center">
                    <Checkbox
                        id={`asistencia-${t.id}`}
                        checked={t.asistencia}
                        onCheckedChange={(checked) => handleTrabajadorChange(t.id, 'asistencia', !!checked)}
                    />
                </div>
                <Select
                    value={t.horas.toString()}
                    onValueChange={(value) => handleTrabajadorChange(t.id, 'horas', parseInt(value, 10))}
                    disabled={!t.asistencia}
                >
                    <SelectTrigger className="w-24 h-9"/>
                    <SelectContent>
                        {[...Array(13).keys()].map(i => <SelectItem key={i} value={i.toString()}>{i}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            ))}
             <Button onClick={handleValidateDay} disabled={isSubmitting} className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>}
                Validar y Enviar Reporte del Día
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
