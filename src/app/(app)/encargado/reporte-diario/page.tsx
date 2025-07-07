
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
import { Loader2, Send, Building, HardHat, User } from 'lucide-react';

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

  const handleSelectSubcontrata = async (subcontrataId: string) => {
    setSelectedSubcontrata(subcontrataId);
    setSelectedProyecto('');
    setProyectos([]);
    setTrabajadores([]);
    setIsLoadingProyectos(true);
    const data = await getProyectosBySubcontrata(subcontrataId);
    setProyectos(data);
    setIsLoadingProyectos(false);
  };

  const handleSelectProyecto = async (proyectoId: string) => {
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
        setSelectedSubcontrata('');
        setSelectedProyecto('');
        setProyectos([]);
        setTrabajadores([]);
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Reporte Diario de Obra</h1>
        <p className="text-muted-foreground mt-1">Sigue los pasos para enviar el reporte de hoy.</p>
      </div>

      {/* Step 1: Select Subcontrata */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</div>
            <span>Selecciona Empresa Subcontratada</span>
          </CardTitle>
          <CardDescription>Elige la empresa para la que vas a reportar.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSubcontratas ? (
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcontratas.map(s => (
                <Button
                  key={s.id}
                  variant={selectedSubcontrata === s.id ? 'default' : 'outline'}
                  className="h-20 text-lg justify-start p-4"
                  onClick={() => handleSelectSubcontrata(s.id)}
                >
                  <Building className="mr-4 h-6 w-6"/> {s.nombre}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Select Proyecto */}
      {selectedSubcontrata && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">2</div>
              <span>Selecciona el Proyecto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProyectos ? (
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proyectos.length > 0 ? (
                  proyectos.map(p => (
                    <Button
                      key={p.id}
                      variant={selectedProyecto === p.id ? 'default' : 'outline'}
                      className="h-20 text-lg justify-start p-4"
                      onClick={() => handleSelectProyecto(p.id)}
                    >
                      <HardHat className="mr-4 h-6 w-6"/> {p.nombre}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground">No hay proyectos para esta subcontrata.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {selectedProyecto && (
         <Card className="animate-fade-in-up">
           <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-lg">3</div>
              <span>Valida la Asistencia y Horas</span>
            </CardTitle>
            <CardDescription>Marca la asistencia y las horas de cada trabajador para hoy.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTrabajadores ? (
              <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>
            ) : (
              trabajadores.length > 0 ? (
                <div className="space-y-4">
                  {trabajadores.map(t => (
                    <div key={t.id} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <Label htmlFor={`asistencia-${t.id}`} className="text-lg font-medium flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground"/>
                        {t.nombre}
                      </Label>
                      <div className="flex flex-col items-center gap-1">
                        <Label htmlFor={`asistencia-${t.id}`} className="text-xs text-muted-foreground">Asiste</Label>
                        <Checkbox
                            id={`asistencia-${t.id}`}
                            checked={t.asistencia}
                            onCheckedChange={(checked) => handleTrabajadorChange(t.id, 'asistencia', !!checked)}
                            className="w-6 h-6"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                         <Label className="text-xs text-muted-foreground">Horas</Label>
                          <Select
                              value={t.horas.toString()}
                              onValueChange={(value) => handleTrabajadorChange(t.id, 'horas', parseInt(value, 10))}
                              disabled={!t.asistencia}
                          >
                              <SelectTrigger className="w-28 h-12 text-base"/>
                              <SelectContent>
                                  {[...Array(13).keys()].map(i => <SelectItem key={i} value={i.toString()}>{i} horas</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleValidateDay} disabled={isSubmitting} className="w-full mt-6 text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
                      {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <Send className="mr-2 h-5 w-5"/>}
                      Validar y Enviar Reporte del Día
                  </Button>
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
