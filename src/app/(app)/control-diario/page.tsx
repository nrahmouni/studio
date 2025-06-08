
// src/app/(app)/control-diario/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, ChevronLeft, ChevronRight, Save, UserCheck, AlertTriangle, Info, Edit3 } from 'lucide-react';
import { format, addDays, subDays, isEqual, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUsuarioById, getUsuariosByEmpresaId } from '@/lib/actions/user.actions';
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import { getControlDiario, saveControlDiario } from '@/lib/actions/controlDiario.actions';
import type { UsuarioFirebase, Obra, ControlDiarioObra, ControlDiarioRegistroTrabajador } from '@/lib/types';
import { ControlDiarioObraFormSchema, type ControlDiarioObraFormData } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';


export default function ControlDiarioPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UsuarioFirebase | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [userObras, setUserObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ControlDiarioObraFormData>({
    resolver: zodResolver(ControlDiarioObraFormSchema),
    defaultValues: {
      obraId: '',
      fecha: selectedDate,
      registrosTrabajadores: [],
      firmaJefeObraURL: null,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'registrosTrabajadores',
    keyName: 'id',
  });

  // Load current user and their obras
  useEffect(() => {
    const loadInitialUserData = async () => {
      setIsLoading(true);
      const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');
      const storedEmpresaId = localStorage.getItem('empresaId_obra_link');

      if (!storedUsuarioId || !storedEmpresaId) {
        setError("Información de sesión no disponible.");
        setIsLoading(false);
        return;
      }
      setEmpresaId(storedEmpresaId);

      try {
        const user = await getUsuarioById(storedUsuarioId);
        setCurrentUser(user);
        if (user && (user.rol === 'admin' || user.rol === 'jefeObra')) {
          const obras = await getObrasByEmpresaId(storedEmpresaId);
          const relevantObras = user.rol === 'admin'
            ? obras
            : obras.filter(o => user.obrasAsignadas?.includes(o.id));
          
          const activeRelevantObras = relevantObras.filter(o => !o.fechaFin || new Date(o.fechaFin) >= new Date());
          setUserObras(activeRelevantObras);

          if (activeRelevantObras.length > 0) {
            const persistedObraId = localStorage.getItem('controlDiario_selectedObraId');
            if (persistedObraId && activeRelevantObras.some(o => o.id === persistedObraId)) {
              setSelectedObraId(persistedObraId);
            } else {
              setSelectedObraId(activeRelevantObras[0].id);
            }
          } else {
            setError("No tienes obras activas asignadas para el control diario.");
          }
        } else {
          setError("Acceso no autorizado para esta sección.");
        }
      } catch (e) {
        setError("Error al cargar datos iniciales del usuario.");
      } finally {
        // setIsLoading(false); // Loading of daily data will handle this
      }
    };
    loadInitialUserData();
  }, []);

  // Load control diario data when obra or date changes
  useEffect(() => {
    if (!selectedObraId || !currentUser || !empresaId) {
      replace([]);
      form.reset({ obraId: selectedObraId, fecha: selectedDate, registrosTrabajadores: [] });
      return;
    }
    
 const fetchControlData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getControlDiario(selectedObraId, selectedDate, currentUser.id, empresaId);
        if (data) {
          form.reset({
            obraId: data.obraId,
            fecha: new Date(data.fecha),
            registrosTrabajadores: data.registrosTrabajadores.map(rt => ({
 ...rt,
 nombreTrabajador: rt.nombreTrabajador || 'Desconocido',
              horasReportadas: rt.horasReportadas === undefined ? null : rt.horasReportadas,
              horaInicio: rt.horaInicio === undefined ? null : rt.horaInicio,
 horaFin: rt.horaFin === undefined ? null : rt.horaFin,
            })),
            firmaJefeObraURL: data.firmaJefeObraURL,
          });
        } else {
           setError("No se pudo cargar o inicializar el control diario para esta obra/fecha.");
           replace([]);
        }
      } catch (e) {
        setError("Error al cargar el control diario.");
        replace([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchControlData();
  }, [selectedObraId, selectedDate, currentUser, empresaId, form, replace]);


  const handleObraChange = (obraId: string) => {
    setSelectedObraId(obraId);
    localStorage.setItem('controlDiario_selectedObraId', obraId);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  };
  
  const calculateWorkedHours = (index: number) => {
    const horaInicioStr = form.watch(`registrosTrabajadores.${index}.horaInicio`);
    const horaFinStr = form.watch(`registrosTrabajadores.${index}.horaFin`);

    if (!horaInicioStr || !horaFinStr) return 'N/A';
    
    const [startH, startM] = horaInicioStr.split(':').map(Number);
    const [endH, endM] = horaFinStr.split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 'N/A';

    const startDate = new Date(0, 0, 0, startH, startM);
    let endDate = new Date(0, 0, 0, endH, endM);

    if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
    }
    
    const diffMillis = endDate.getTime() - startDate.getTime();
    if (diffMillis < 0) return 'N/A';
    
    const diffHours = diffMillis / (1000 * 60 * 60);
    return diffHours.toFixed(2) + 'h';
  };


  const onSubmit = async (formData: ControlDiarioObraFormData) => {
    if (!currentUser) {
        toast({ title: "Error", description: "Usuario no autenticado.", variant: "destructive" });
        return;
    }
    if (!empresaId) {
        toast({ title: "Error", description: "ID de empresa no disponible.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
      const result = await saveControlDiario(formData, currentUser.id);
      if (result.success) {
        toast({ title: "Éxito", description: "Control diario guardado." });
        const updatedData = await getControlDiario(selectedObraId, selectedDate, currentUser.id, empresaId);
         if (updatedData) {
          form.reset({
            obraId: updatedData.obraId,
            fecha: new Date(updatedData.fecha),
            registrosTrabajadores: updatedData.registrosTrabajadores.map(rt => ({
                ...rt,
                nombreTrabajador: rt.nombreTrabajador || 'Desconocido',
              })),
            firmaJefeObraURL: updatedData.firmaJefeObraURL,
          });
        }
      } else {
        toast({ title: "Error al Guardar", description: result.message || "No se pudo guardar el control.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser && !isLoading && !error) {
    return <div className="container mx-auto py-8 px-4"><Card className="bg-destructive/10 border-destructive text-destructive"><CardHeader><CardTitle>Error de Usuario</CardTitle></CardHeader><CardContent><p>No se pudo cargar la información del usuario. Intente recargar la página.</p></CardContent></Card></div>;
  }
  if (currentUser && currentUser.rol === 'trabajador'){
     return <div className="container mx-auto py-8 px-4"><Card className="bg-amber-500/10 border-amber-500 text-amber-700"><CardHeader><CardTitle>Acceso Restringido</CardTitle></CardHeader><CardContent><p>Esta sección es solo para Jefes de Obra y Administradores.</p></CardContent></Card></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <UserCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Control Diario de Obra</CardTitle>
              <CardDescription className="text-md text-muted-foreground">
                Registra asistencia, horas y valida el trabajo diario de los trabajadores.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Obra and Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="obraControlSelect" className="font-semibold">Obra</Label>
              {userObras.length > 0 ? (
                <Select value={selectedObraId} onValueChange={handleObraChange} disabled={isLoading || isSaving}>
                  <SelectTrigger id="obraControlSelect" className="mt-1">
                    <SelectValue placeholder="Selecciona una obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {userObras.map(obra => (
                      <SelectItem key={obra.id} value={obra.id}>{obra.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value="No hay obras asignadas o activas" disabled className="mt-1"/>
              )}
            </div>
            <div>
              <Label className="font-semibold block mb-1">Fecha</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleDateChange(subDays(selectedDate, 1))} disabled={isLoading || isSaving}><ChevronLeft/></Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-grow justify-start text-left font-normal"
                      disabled={isLoading || isSaving}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateChange}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={() => handleDateChange(addDays(selectedDate, 1))} disabled={isLoading || isSaving}><ChevronRight/></Button>
                 <Button variant="outline" onClick={() => handleDateChange(new Date())} disabled={isEqual(selectedDate, startOfDay(new Date())) || isLoading || isSaving}>Hoy</Button>
              </div>
            </div>
          </div>

          {error && (
            <Card className="bg-destructive/10 border-destructive text-destructive">
              <CardHeader><CardTitle className="text-sm flex items-center"><AlertTriangle className="mr-2 h-5 w-5" />Error</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{error}</p></CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">Cargando control diario...</p></div>
          ) : !selectedObraId || fields.length === 0 && !error ? (
             <Card className="bg-muted/30 border-border p-6 text-center">
                <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3"/>
                <p className="text-muted-foreground">
                    { !selectedObraId ? "Selecciona una obra para ver el control diario." : "No hay trabajadores asignados a esta obra para la fecha seleccionada, o no se pudo cargar la información." }
                </p>
                 {selectedObraId && <p className="text-xs text-muted-foreground mt-1">Asegúrate de que los trabajadores están asignados a la obra en la sección 'Editar Obra'.</p>}
            </Card>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...form.register("obraId")} value={selectedObraId} />
              <input type="hidden" {...form.register("fecha")} value={selectedDate.toISOString()} />

              {isMobile ? (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-md">{form.watch(`registrosTrabajadores.${index}.nombreTrabajador`) || field.usuarioId}</h4>
                         <div className="flex items-center space-x-2">
                           <Label htmlFor={`asistencia-${field.id}`} className="text-sm text-muted-foreground">Asistencia:</Label>
                            <Controller
                              name={`registrosTrabajadores.${index}.asistencia`}
                              control={form.control}
                              render={({ field: controllerField }) => (
                                <Checkbox
                                  id={`asistencia-${field.id}`}
                                  checked={controllerField.value}
                                  onCheckedChange={controllerField.onChange}
                                  disabled={isSaving}
                                />
                              )}
                            />
                         </div>
                      </div>
                      
                       {form.watch(`registrosTrabajadores.${index}.asistencia`) && (
                         <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <Label htmlFor={`horaInicio-${field.id}`} className="text-xs text-muted-foreground">Hora Inicio:</Label>
                                <Input
                                  id={`horaInicio-${field.id}`}
                                  type="time"
                                  {...form.register(`registrosTrabajadores.${index}.horaInicio`)}
                                  className="w-full h-8 text-xs"
                                  disabled={isSaving}
                                />
                            </div>
                             <div>
                                <Label htmlFor={`horaFin-${field.id}`} className="text-xs text-muted-foreground">Hora Fin:</Label>
                                <Input
                                  id={`horaFin-${field.id}`}
                                  type="time"
                                  {...form.register(`registrosTrabajadores.${index}.horaFin`)}
                                  className="w-full h-8 text-xs"
                                  disabled={isSaving}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs text-muted-foreground block">Horas Calculadas:</Label>
                                <p className="font-mono">{calculateWorkedHours(index)}</p>
                            </div>
                             <div className="col-span-2">
                                <Label htmlFor={`horasReportadas-${field.id}`} className="text-xs text-muted-foreground">Horas Reportadas:</Label>
                                <Input
                                  id={`horasReportadas-${field.id}`}
                                  type="number"
                                  step="0.1"
                                  {...form.register(`registrosTrabajadores.${index}.horasReportadas`, { valueAsNumber: true })}
                                  className="w-full h-8 text-xs"
                                  placeholder="Ej: 8"
                                  disabled={isSaving}
                                />
                            </div>
                             <div className="col-span-2 flex items-center space-x-2 pt-2">
                                 <Controller
                                  name={`registrosTrabajadores.${index}.validadoPorJefeObra`}
                                  control={form.control}
                                  render={({ field: controllerField }) => (
                                    <Checkbox
                                       id={`validado-${field.id}`}
                                      checked={controllerField.value}
                                      onCheckedChange={controllerField.onChange}
                                      disabled={isSaving}
                                    />
                                  )}
                                />
                                <Label htmlFor={`validado-${field.id}`} className="text-sm">Validado por Jefe de Obra</Label>
                            </div>
                         </div>
                       )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                         <th className="p-2 text-left font-semibold text-sm text-muted-foreground">Asist.</th>
                        <th className="p-2 text-left font-semibold text-sm text-muted-foreground">Trabajador</th>
                        <th className="p-2 text-left font-semibold text-sm text-muted-foreground">H. Inicio</th>
                        <th className="p-2 text-left font-semibold text-sm text-muted-foreground">H. Fin</th>
                        <th className="p-2 text-left font-semibold text-sm text-muted-foreground">H. Calc.</th>
                        <th className="p-2 text-left font-semibold text-sm text-muted-foreground">H. Report.</th>
                        <th className="p-2 text-left font-semibold text-sm text-muted-foreground">Validado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id} className="border-b last:border-b-0 hover:bg-muted/50">
                          <td className="p-2 align-middle">
                            <Controller
                              name={`registrosTrabajadores.${index}.asistencia`}
                              control={form.control}
                              render={({ field: controllerField }) => (
                                <Checkbox
                                  checked={controllerField.value}
                                  onCheckedChange={controllerField.onChange}
                                  disabled={isSaving}
                                />
                              )}
                            />
                          </td>
                          <td className="p-2 align-middle text-sm">{form.watch(`registrosTrabajadores.${index}.nombreTrabajador`) || field.usuarioId}</td>
                          <td className="p-2 align-middle">
                            <Input
                              type="time"
                              {...form.register(`registrosTrabajadores.${index}.horaInicio`)}
                              className="w-28 h-9 text-sm"
                              disabled={isSaving || !form.watch(`registrosTrabajadores.${index}.asistencia`)}
                            />
                          </td>
                          <td className="p-2 align-middle">
                             <Input
                              type="time"
                              {...form.register(`registrosTrabajadores.${index}.horaFin`)}
                              className="w-28 h-9 text-sm"
                              disabled={isSaving || !form.watch(`registrosTrabajadores.${index}.asistencia`)}
                            />
                          </td>
                           <td className="p-2 align-middle text-sm text-muted-foreground w-20">
                             {form.watch(`registrosTrabajadores.${index}.asistencia`) ? calculateWorkedHours(index) : 'N/A'}
                           </td>
                          <td className="p-2 align-middle">
                            <Input
                              type="number"
                              step="0.1"
                              {...form.register(`registrosTrabajadores.${index}.horasReportadas`, { valueAsNumber: true })}
                              className="w-24 h-9 text-sm"
                              placeholder="Ej: 8"
                              disabled={isSaving || !form.watch(`registrosTrabajadores.${index}.asistencia`)}
                            />
                          </td>
                          <td className="p-2 align-middle">
                             <Controller
                              name={`registrosTrabajadores.${index}.validadoPorJefeObra`}
                              control={form.control}
                              render={({ field: controllerField }) => (
                                <Checkbox
                                  checked={controllerField.value}
                                  onCheckedChange={controllerField.onChange}
                                  disabled={isSaving}
                                  title="Marcar como validado por Jefe de Obra"
                                />
                              )}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSaving || isLoading || fields.length === 0}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar / Validar Día
                </Button>
              </div>
            </form>
          )}
        </CardContent>
         <CardFooter className="p-4 border-t text-center">
            <p className="text-xs text-muted-foreground mx-auto">
                Este control permite al Jefe de Obra llevar un registro diario de la asistencia y horas trabajadas, y validarlas.
            </p>
         </CardFooter>
      </Card>
    </div>
  );
}
