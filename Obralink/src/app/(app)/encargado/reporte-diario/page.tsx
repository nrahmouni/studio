
'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getSubcontratas, getProyectosBySubcontrata, getTrabajadoresByProyecto, saveDailyReport } from '@/lib/actions/app.actions';
import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador } from '@/lib/types';
import { Loader2, Send, Building, HardHat, User, Plus, Minus, MessageSquare, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface TrabajadorConEstado extends Trabajador {
  asistencia: boolean;
  horas: number;
}

export default function ReporteDiarioPage() {
  const { toast } = useToast();
  const [subcontratas, setSubcontratas] = useState<Subcontrata[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [trabajadores, setTrabajadores] = useState<TrabajadorConEstado[]>([]);
  const [comentarios, setComentarios] = useState('');
  const [fotos, setFotos] = useState<string[]>(['']);
  
  const [selectedSubcontrata, setSelectedSubcontrata] = useState<string>('');
  const [selectedProyecto, setSelectedProyecto] = useState<string>('');
  
  const [isLoadingSubcontratas, setIsLoadingSubcontratas] = useState(true);
  const [isLoadingProyectos, setIsLoadingProyectos] = useState(false);
  const [isLoadingTrabajadores, setIsLoadingTrabajadores] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const proyectosCardRef = useRef<HTMLDivElement>(null);
  const trabajadoresCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSubcontratas = async () => {
      setIsLoadingSubcontratas(true);
      const data = await getSubcontratas();
      setSubcontratas(data);
      setIsLoadingSubcontratas(false);
    };
    fetchSubcontratas();
  }, []);

  useEffect(() => {
    if (selectedSubcontrata && !selectedProyecto && proyectosCardRef.current) {
      setTimeout(() => {
        proyectosCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [selectedSubcontrata, selectedProyecto]);

  useEffect(() => {
    if (selectedProyecto && trabajadoresCardRef.current) {
      setTimeout(() => {
        trabajadoresCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [selectedProyecto]);

  const handleSelectSubcontrata = async (subcontrataId: string) => {
    setSelectedSubcontrata(subcontrataId);
    setSelectedProyecto('');
    setProyectos([]);
    setTrabajadores([]);
    setComentarios('');
    setFotos(['']);
    setIsLoadingProyectos(true);
    const data = await getProyectosBySubcontrata(subcontrataId);
    setProyectos(data);
    setIsLoadingProyectos(false);
  };
  
  const handleClearSelection = () => {
    setSelectedSubcontrata('');
    setSelectedProyecto('');
    setProyectos([]);
    setTrabajadores([]);
    setComentarios('');
    setFotos(['']);
  };

  const getSelectedSubcontrataName = () => {
    return subcontratas.find(s => s.id === selectedSubcontrata)?.nombre || '';
  };

  const handleSelectProyecto = async (proyectoId: string) => {
    setSelectedProyecto(proyectoId);
    setTrabajadores([]);
    setComentarios('');
    setFotos(['']);
    if (!proyectoId) return;
    setIsLoadingTrabajadores(true);
    const data = await getTrabajadoresByProyecto(proyectoId);
    const trabajadoresConEstado = data.map(t => ({ ...t, asistencia: true, horas: 8 }));
    setTrabajadores(trabajadoresConEstado);
    setIsLoadingTrabajadores(false);
  };

  const handleClearProyectoSelection = () => {
    setSelectedProyecto('');
    setTrabajadores([]);
    setComentarios('');
    setFotos(['']);
  };

  const getSelectedProyectoName = () => {
    return proyectos.find(p => p.id === selectedProyecto)?.nombre || '';
  };

  const handleTrabajadorChange = (trabajadorId: string, field: 'asistencia' | 'horas', value: boolean | number) => {
    setTrabajadores(prev =>
      prev.map(t =>
        t.id === trabajadorId ? { ...t, [field]: value } : t
      )
    );
  };
  
  const handleFotoChange = (index: number, value: string) => {
    const newFotos = [...fotos];
    newFotos[index] = value;
    setFotos(newFotos);
  };

  const addFotoInput = () => setFotos([...fotos, '']);
  
  const handleValidateDay = async () => {
    const currentUserId = localStorage.getItem('encargadoId_obra_link');
    if (!selectedProyecto || !currentUserId) {
        toast({ title: "Error", description: "Falta seleccionar un proyecto o no se pudo identificar al encargado.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    
    const reporte: ReporteTrabajador[] = trabajadores
      .filter(t => t.asistencia)
      .map(t => ({
        trabajadorId: t.id,
        nombre: t.nombre,
        asistencia: true,
        horas: t.horas,
      }));

    if (reporte.length === 0) {
      toast({
        title: "Atención",
        description: "No se puede enviar un reporte si no ha asistido ningún trabajador.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const fotosValidas = fotos.filter(f => f.trim() !== '');

    const result = await saveDailyReport(selectedProyecto, currentUserId, reporte, comentarios, fotosValidas);
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
        <h1 className="text-3xl font-bold font-headline text-primary">Reporte Diario de Obra</h1>
        <p className="text-muted-foreground mt-1">Sigue los pasos para enviar el reporte de hoy.</p>
      </div>

      {/* Step 1 & 2 */}
      <Card className="animate-fade-in-up transition-all duration-300">
        { selectedSubcontrata ? (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">1</div>
                    <Building className="h-5 w-5 text-primary" />
                    <p className="text-md font-semibold">{getSelectedSubcontrataName()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearSelection}>Cambiar</Button>
            </div>
        ) : (
            <>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</div>
                        <span>Selecciona Empresa Subcontratada</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingSubcontratas ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subcontratas.map(s => (
                        <Button key={s.id} variant={'outline'} className="h-20 text-lg justify-start p-4" onClick={() => handleSelectSubcontrata(s.id)}>
                            <Building className="mr-4 h-6 w-6"/> {s.nombre}
                        </Button>
                    ))}
                    </div>
                )}
                </CardContent>
            </>
        )}
      </Card>

      {selectedSubcontrata && (
        <Card ref={proyectosCardRef} className="animate-fade-in-up">
            { selectedProyecto ? (
                 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">2</div>
                        <HardHat className="h-5 w-5 text-primary" />
                        <p className="text-md font-semibold">{getSelectedProyectoName()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClearProyectoSelection}>Cambiar</Button>
                </div>
            ) : (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">2</div>
                        <span>Selecciona el Proyecto</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingProyectos ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" />
                        </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {proyectos.length > 0 ? (
                            proyectos.map(p => (
                                <Button key={p.id} variant={'outline'} className="h-20 text-lg justify-start p-4" onClick={() => handleSelectProyecto(p.id)}>
                                    <HardHat className="mr-4 h-6 w-6"/> {p.nombre}
                                </Button>
                            ))
                            ) : (
                            <p className="text-muted-foreground">No hay proyectos para esta subcontrata.</p>
                            )}
                        </div>
                        )}
                    </CardContent>
                </>
            )}
        </Card>
      )}
      
      {/* Step 3: Validate Workers */}
      {selectedProyecto && (
         <Card ref={trabajadoresCardRef} className="animate-fade-in-up">
           <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-lg">3</div>
              <span>Valida Asistencia y Horas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTrabajadores ? (
              <div className="space-y-4">
                  <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
              </div>
            ) : (
              trabajadores.length > 0 ? (
                <div className="space-y-4">
                  {trabajadores.map(t => (
                    <div key={t.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4">
                      <Label htmlFor={`asistencia-${t.id}`} className="text-lg font-medium flex items-center gap-3 cursor-pointer">
                          <User className="h-5 w-5 text-muted-foreground"/>{t.nombre}
                      </Label>
                      <div className="flex items-center gap-4 sm:gap-6">
                          <div className="flex items-center gap-2">
                              <Checkbox id={`asistencia-${t.id}`} checked={t.asistencia} onCheckedChange={(checked) => handleTrabajadorChange(t.id, 'asistencia', !!checked)} className="w-6 h-6"/>
                              <Label htmlFor={`asistencia-${t.id}`} className="text-md font-medium cursor-pointer">Asiste</Label>
                          </div>
                          <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => handleTrabajadorChange(t.id, 'horas', Math.max(0, t.horas - 1))} disabled={!t.asistencia || t.horas <= 0}><Minus className="h-5 w-5" /></Button>
                              <span className="font-bold text-xl w-12 text-center tabular-nums">{t.asistencia ? `${t.horas}h` : '--'}</span>
                              <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => handleTrabajadorChange(t.id, 'horas', Math.min(12, t.horas + 1))} disabled={!t.asistencia || t.horas >= 12}><Plus className="h-5 w-5" /></Button>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-muted-foreground text-center py-4">No hay trabajadores asignados a este proyecto.</p>
              )
            )}
          </CardContent>
         </Card>
      )}

      {/* Step 4 & 5: Photos, Comments and Submit */}
      {selectedProyecto && (
         <Card className="animate-fade-in-up">
           <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-lg">4</div>
              <span>Adjuntar Fotos y Comentarios (Opcional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="font-semibold flex items-center gap-2 mb-2"><Camera className="h-5 w-5"/>Fotos del Progreso</Label>
              <div className="space-y-2">
                {fotos.map((foto, index) => (
                  <Input key={index} type="url" placeholder="https://ejemplo.com/foto.jpg" value={foto} onChange={(e) => handleFotoChange(index, e.target.value)} />
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFotoInput} className="mt-2">Añadir otra foto</Button>
            </div>
            <div>
                <Label htmlFor="comentarios" className="font-semibold flex items-center gap-2 mb-2"><MessageSquare className="h-5 w-5"/>Comentarios Adicionales</Label>
                <Textarea id="comentarios" placeholder="Ej: Se ha recibido el material de fontanería. Mañana se empezará con la instalación." value={comentarios} onChange={(e) => setComentarios(e.target.value)} rows={4}/>
            </div>
            <Button onClick={handleValidateDay} disabled={isSubmitting} className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <Send className="mr-2 h-5 w-5"/>}
                Validar y Enviar Reporte del Día
            </Button>
          </CardContent>
         </Card>
      )}
    </div>
  );
}
