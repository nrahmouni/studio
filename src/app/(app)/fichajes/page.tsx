
// src/app/(app)/fichajes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, LogIn, LogOut, Coffee, Briefcase, AlertTriangle, Info, Filter, CheckCircle, ShieldAlert, UsersIcon, CalendarDays, FileText as PdfIcon } from 'lucide-react';
import { getUsuarioById, getUsuariosByEmpresaId } from '@/lib/actions/user.actions';
import { getObraById, getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import { createFichaje, getFichajesHoyUsuarioObra, getFichajesByCriteria, validateFichaje } from '@/lib/actions/fichaje.actions';
import type { UsuarioFirebase, Obra, Fichaje, FichajeTipo, GetFichajesCriteria } from '@/lib/types';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type FichajeStatus = 'no_fichado' | 'trabajando' | 'en_descanso';
type ViewMode = 'trabajador' | 'admin';

export default function FichajesPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UsuarioFirebase | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('trabajador');
  
  // Worker view states
  const [userObras, setUserObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([]);
  const [currentStatus, setCurrentStatus] = useState<FichajeStatus>('no_fichado');
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);
  
  // Admin/Manager view states
  const [adminFichajes, setAdminFichajes] = useState<Fichaje[]>([]);
  const [companyObras, setCompanyObras] = useState<Obra[]>([]); // All obras for admin, assigned for jefe
  const [companyTrabajadores, setCompanyTrabajadores] = useState<UsuarioFirebase[]>([]);
  const [usuariosMap, setUsuariosMap] = useState<Record<string, string>>({});
  const [obrasMap, setObrasMap] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<Partial<GetFichajesCriteria>>({ 
    estadoValidacion: 'pendientes' 
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  // General states
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingObras, setIsLoadingObras] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false); // For worker view
  const [isLoadingAdminFichajes, setIsLoadingAdminFichajes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // For worker actions or validation
  const [error, setError] = useState<string | null>(null);

  // Determine view mode and load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingUser(true);
      setError(null);
      const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');
      const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
      const storedUserRole = localStorage.getItem('userRole_obra_link') as UsuarioFirebase['rol'] | null;

      if (!storedUsuarioId || !storedEmpresaId || !storedUserRole) {
        setError("Información de sesión no disponible. Por favor, inicia sesión.");
        setIsLoadingUser(false);
        return;
      }

      try {
        const user = await getUsuarioById(storedUsuarioId);
        setCurrentUser(user);

        if (user) {
          if (user.rol === 'admin' || user.rol === 'jefeObra') {
            setViewMode('admin');
            setIsLoadingAdminFichajes(true);
            
            let obrasParaFiltro: Obra[];
            if (user.rol === 'admin') {
              obrasParaFiltro = await getObrasByEmpresaId(user.empresaId);
            } else { // jefeObra
              const todasObrasEmpresa = await getObrasByEmpresaId(user.empresaId);
              obrasParaFiltro = todasObrasEmpresa.filter(o => user.obrasAsignadas?.includes(o.id));
            }
            setCompanyObras(obrasParaFiltro);

            const trabajadores = await getUsuariosByEmpresaId(user.empresaId).then(users => users.filter(u => u.rol === 'trabajador'));
            setCompanyTrabajadores(trabajadores);
            
            const allUsers = await getUsuariosByEmpresaId(user.empresaId);
            const tempUsuariosMap: Record<string, string> = allUsers.reduce((acc, u) => { acc[u.id] = u.nombre; return acc; }, {} as Record<string, string>);
            setUsuariosMap(tempUsuariosMap);
            
            const todasObrasEmpresaGlobal = await getObrasByEmpresaId(user.empresaId);
            const tempObrasMap: Record<string, string> = todasObrasEmpresaGlobal.reduce((acc, o) => { acc[o.id] = o.nombre; return acc; }, {} as Record<string, string>);
            setObrasMap(tempObrasMap);

            setIsLoadingAdminFichajes(false); // Fichajes se cargarán en el effect de filtros
          } else { // Trabajador view
            setViewMode('trabajador');
            if (user.obrasAsignadas && user.obrasAsignadas.length > 0) {
              setIsLoadingObras(true);
              const obrasPromises = user.obrasAsignadas.map(id => getObraById(id, user.empresaId));
              const fetchedObras = (await Promise.all(obrasPromises)).filter(Boolean) as Obra[];
              const activeObras = fetchedObras.filter(o => !o.fechaFin || new Date(o.fechaFin) >= new Date());
              setUserObras(activeObras);
              if (activeObras.length > 0) {
                const persistedObraId = localStorage.getItem('fichaje_selectedObraId');
                if (persistedObraId && activeObras.some(o => o.id === persistedObraId)) {
                  setSelectedObraId(persistedObraId);
                } else {
                  setSelectedObraId(activeObras[0].id);
                }
              } else { setError("No tienes obras activas asignadas para fichar."); }
              setIsLoadingObras(false);
            } else { setError("No tienes obras asignadas para fichar."); }
          }
        } else { setError("No se pudo cargar la información del usuario."); }
      } catch (e) {
        setError("Error al cargar datos iniciales."); console.error(e);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadInitialData();
  }, []);

  // Effect for worker: Load fichaje status when selectedObraId or currentUser changes
  useEffect(() => {
    if (viewMode !== 'trabajador' || !currentUser || !selectedObraId) {
      setCurrentStatus('no_fichado'); setFichajesHoy([]);
      return;
    }
    const fetchStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const hoy = await getFichajesHoyUsuarioObra(currentUser.id, selectedObraId);
        setFichajesHoy(hoy);
        if (hoy.length > 0) {
          const ultimoFichaje = hoy[hoy.length - 1];
          setLastActionTime(ultimoFichaje.timestamp);
          switch (ultimoFichaje.tipo) {
            case 'entrada': case 'finDescanso': setCurrentStatus('trabajando'); break;
            case 'inicioDescanso': setCurrentStatus('en_descanso'); break;
            case 'salida': setCurrentStatus('no_fichado'); break;
          }
        } else { setCurrentStatus('no_fichado'); setLastActionTime(null); }
      } catch (e) { setError("Error al cargar el estado de fichaje."); toast({ title: "Error", description: "No se pudo obtener el estado de fichaje.", variant: "destructive" });
      } finally { setIsLoadingStatus(false); }
    };
    fetchStatus();
  }, [currentUser, selectedObraId, toast, viewMode]);
  
  // Effect for admin: Fetch fichajes when filters or dateRange change
  useEffect(() => {
    if (viewMode !== 'admin' || !currentUser?.empresaId) return;
    
    const fetchAdminFichajes = async () => {
      setIsLoadingAdminFichajes(true);
      try {
        const criteria: GetFichajesCriteria = { 
          empresaId: currentUser.empresaId!, 
          ...filters,
          fechaInicio: dateRange?.from ? startOfDay(dateRange.from) : undefined,
          fechaFin: dateRange?.to ? endOfDay(dateRange.to) : undefined,
        };
        const fetchedFichajes = await getFichajesByCriteria(criteria);
        setAdminFichajes(fetchedFichajes);
      } catch (e) {
        toast({ title: "Error", description: "No se pudieron cargar los fichajes.", variant: "destructive" });
      } finally {
        setIsLoadingAdminFichajes(false);
      }
    };
    fetchAdminFichajes();
  }, [filters, dateRange, currentUser, viewMode, toast]);


  const handleObraChange = (obraId: string) => {
    setSelectedObraId(obraId);
    localStorage.setItem('fichaje_selectedObraId', obraId);
  };

  const handleFichajeAction = async (tipo: FichajeTipo) => {
    if (!currentUser || !selectedObraId) {
      toast({ title: "Error", description: "Usuario u obra no seleccionados.", variant: "destructive" }); return;
    }
    setIsSubmitting(true);
    try {
      const result = await createFichaje({ usuarioId: currentUser.id, obraId: selectedObraId, tipo });
      if (result.success && result.fichaje) {
        toast({ title: "Acción Registrada", description: `Fichaje de ${tipo} realizado con éxito.` });
        const hoy = await getFichajesHoyUsuarioObra(currentUser.id, selectedObraId);
        setFichajesHoy(hoy);
        if (hoy.length > 0) {
          const ultimoFichaje = hoy[hoy.length - 1];
          setLastActionTime(ultimoFichaje.timestamp);
          switch (ultimoFichaje.tipo) {
            case 'entrada': case 'finDescanso': setCurrentStatus('trabajando'); break;
            case 'inicioDescanso': setCurrentStatus('en_descanso'); break;
            case 'salida': setCurrentStatus('no_fichado'); break;
          }
        } else { setCurrentStatus('no_fichado'); setLastActionTime(null); }
      } else {
        toast({ title: "Error al Fichar", description: result.message || "No se pudo registrar la acción.", variant: "destructive" });
      }
    } catch (e) { toast({ title: "Error Inesperado", description: "Ocurrió un error al fichar.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };
  
  const handleValidateFichaje = async (fichajeId: string) => {
    if (!currentUser?.id || !currentUser.empresaId) {
         toast({ title: "Error", description: "No se pudo identificar al usuario o empresa para validar.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const result = await validateFichaje(fichajeId, currentUser.id, currentUser.empresaId);
      if (result.success && result.fichaje) {
        toast({ title: "Fichaje Validado", description: "El registro ha sido marcado como validado." });
        setAdminFichajes(prev => prev.map(f => f.id === fichajeId ? {...f, validado: true, validadoPor: currentUser.id} : f));
      } else {
        toast({ title: "Error al Validar", description: result.message || "No se pudo validar.", variant: "destructive" });
      }
    } catch (e) { toast({ title: "Error Inesperado", description: "Ocurrió un error.", variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleGeneratePartePDF = () => {
    const validatedFichajes = adminFichajes.filter(f => f.validado);
    if (validatedFichajes.length > 0) {
      toast({
        title: "Generación de PDF",
        description: `Funcionalidad en desarrollo. Se procesarían ${validatedFichajes.length} fichajes validados.`,
        duration: 5000,
      });
    } else {
      toast({
        title: "Sin Datos para PDF",
        description: "No hay fichajes validados en la vista actual para generar un PDF.",
        variant: "default"
      });
    }
    // Aquí iría la lógica para llamar a una función que genere el PDF
    console.log("Intentando generar PDF para fichajes:", validatedFichajes);
  };
  
  const selectedObraNombre = userObras.find(o => o.id === selectedObraId)?.nombre || "Desconocida";

  if (isLoadingUser) {
    return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">Cargando...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-destructive/10 border-destructive text-destructive animate-fade-in-up max-w-md mx-auto">
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === 'trabajador') {
    const canSelectObra = currentStatus === 'no_fichado' && userObras.length > 0;
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto shadow-xl animate-fade-in-up">
          <CardHeader className="bg-primary/5 p-6">
            <div className="flex items-center space-x-3"><Clock className="h-8 w-8 text-primary" />
              <div><CardTitle className="text-2xl font-bold font-headline text-primary">Sistema de Fichaje</CardTitle><CardDescription className="text-md text-muted-foreground">Registra tu jornada laboral.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isLoadingObras ? ( <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Cargando obras...</div>
            ) : userObras.length === 0 && !error ? (
              <Card className="bg-muted/50 border-muted p-4"><CardHeader className="p-0 mb-2"><CardTitle className="text-md flex items-center"><Info className="mr-2 h-5 w-5 text-primary" />No hay Obras</CardTitle></CardHeader><CardContent className="p-0 text-sm">No tienes obras activas asignadas. Contacta con tu administrador.</CardContent></Card>
            ) : (
              <div><label htmlFor="obraSelect" className="block text-sm font-medium text-foreground mb-1">Obra Actual:</label>
                <Select value={selectedObraId} onValueChange={handleObraChange} disabled={!canSelectObra || isSubmitting}>
                  <SelectTrigger id="obraSelect" className="w-full"><SelectValue placeholder="Selecciona una obra" /></SelectTrigger>
                  <SelectContent>{userObras.map(obra => (<SelectItem key={obra.id} value={obra.id}>{obra.nombre}</SelectItem>))}</SelectContent>
                </Select>
                {!canSelectObra && selectedObraId && <p className="text-xs text-muted-foreground mt-1">Para cambiar de obra, primero debes fichar salida.</p>}
              </div>
            )}
            {isLoadingStatus ? ( <div className="flex items-center justify-center py-4"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Actualizando estado...</div>
            ) : (
              <Card className="bg-secondary/20 p-4 border-dashed border-secondary"><CardHeader className="p-0 mb-2"><CardTitle className="text-lg font-semibold text-primary">Estado Actual</CardTitle></CardHeader>
                <CardContent className="p-0 text-md">
                  {currentStatus === 'no_fichado' && <p>No has fichado entrada en <span className="font-semibold">{selectedObraNombre}</span>.</p>}
                  {currentStatus === 'trabajando' && <p>Trabajando en <span className="font-semibold">{selectedObraNombre}</span> desde {lastActionTime ? format(lastActionTime, 'HH:mm', { locale: es }) : ''}.</p>}
                  {currentStatus === 'en_descanso' && <p>En descanso (en <span className="font-semibold">{selectedObraNombre}</span>) desde {lastActionTime ? format(lastActionTime, 'HH:mm', { locale: es }) : ''}.</p>}
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {currentStatus === 'no_fichado' && (<Button onClick={() => handleFichajeAction('entrada')} className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting || isLoadingStatus || !selectedObraId}>{isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <LogIn className="mr-2 h-5 w-5"/>} Fichar Entrada</Button>)}
              {currentStatus === 'trabajando' && (<><Button onClick={() => handleFichajeAction('inicioDescanso')} className="w-full text-lg py-6 bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting || isLoadingStatus}>{isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Coffee className="mr-2 h-5 w-5"/>} Marcar Descanso</Button><Button onClick={() => handleFichajeAction('salida')} className="w-full text-lg py-6 bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting || isLoadingStatus}>{isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <LogOut className="mr-2 h-5 w-5"/>} Fichar Salida</Button></>)}
              {currentStatus === 'en_descanso' && (<Button onClick={() => handleFichajeAction('finDescanso')} className="w-full text-lg py-6 bg-sky-500 hover:bg-sky-600 text-white" disabled={isSubmitting || isLoadingStatus}>{isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <LogIn className="mr-2 h-5 w-5"/>} Volver de Descanso</Button>)}
            </div>
          </CardContent>
          <CardFooter className="p-6 text-center border-t"><p className="text-xs text-muted-foreground">Hoy es {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}.{currentUser && ` Bienvenido, ${currentUser.nombre.split(' ')[0]}.`}</p></CardFooter>
        </Card>
      </div>
    );
  }

  // Admin/Manager View
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3"><UsersIcon className="h-8 w-8 text-primary" />
            <div><CardTitle className="text-2xl font-bold font-headline text-primary">Gestión de Fichajes</CardTitle><CardDescription className="text-md text-muted-foreground">Consulta y valida los registros de fichajes de los trabajadores.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Filters Section */}
          <Card className="bg-card border p-4">
            <CardTitle className="text-lg mb-3 flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>Filtros</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="adminObraFilter" className="text-sm font-medium">Obra</label>
                <Select value={filters.obraId || 'all'} onValueChange={(val) => setFilters(f => ({...f, obraId: val === 'all' ? undefined : val}))} disabled={isLoadingAdminFichajes}>
                  <SelectTrigger id="adminObraFilter"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Todas las Obras</SelectItem>{companyObras.map(o => <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="adminUserFilter" className="text-sm font-medium">Trabajador</label>
                <Select value={filters.usuarioId || 'all'} onValueChange={(val) => setFilters(f => ({...f, usuarioId: val === 'all' ? undefined : val}))} disabled={isLoadingAdminFichajes}>
                  <SelectTrigger id="adminUserFilter"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Todos los Trabajadores</SelectItem>{companyTrabajadores.map(u => <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="adminDateFilter" className="text-sm font-medium">Rango de Fechas</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="adminDateFilter" variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")} disabled={isLoadingAdminFichajes}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "dd/MM/yy", {locale:es})} - ${format(dateRange.to, "dd/MM/yy", {locale:es})}` : format(dateRange.from, "dd/MM/yy", {locale:es})) : <span>Selecciona rango</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es} />
                    </PopoverContent>
                  </Popover>
              </div>
              <div>
                <label htmlFor="adminValidationFilter" className="text-sm font-medium">Estado Validación</label>
                <Select value={filters.estadoValidacion || 'todos'} onValueChange={(val) => setFilters(f => ({...f, estadoValidacion: val as 'todos' | 'validados' | 'pendientes'}))} disabled={isLoadingAdminFichajes}>
                  <SelectTrigger id="adminValidationFilter"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="validados">Validados</SelectItem><SelectItem value="pendientes">Pendientes</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
             <Button 
                onClick={handleGeneratePartePDF} 
                variant="outline" 
                className="mt-4 border-accent text-accent hover:bg-accent/10 w-full md:w-auto"
                disabled={isLoadingAdminFichajes || adminFichajes.length === 0}
            >
                <PdfIcon className="mr-2 h-5 w-5" /> Generar Parte de Fichajes (PDF)
            </Button>
          </Card>

          {/* Fichajes List/Table */}
          {isLoadingAdminFichajes ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">Cargando fichajes...</p></div>
          ) : adminFichajes.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No se encontraron fichajes con los filtros aplicados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead><TableHead>Obra</TableHead><TableHead>Fecha</TableHead><TableHead>Hora</TableHead>
                    <TableHead>Tipo</TableHead><TableHead>Estado</TableHead><TableHead>Validado Por</TableHead><TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminFichajes.map(fichaje => (
                    <TableRow key={fichaje.id}>
                      <TableCell>{usuariosMap[fichaje.usuarioId] || 'Desconocido'}</TableCell>
                      <TableCell>{obrasMap[fichaje.obraId] || 'Desconocida'}</TableCell>
                      <TableCell>{format(fichaje.timestamp, 'dd/MM/yyyy', {locale: es})}</TableCell>
                      <TableCell>{format(fichaje.timestamp, 'HH:mm:ss', {locale: es})}</TableCell>
                      <TableCell>
                        <Badge variant={fichaje.tipo === 'entrada' || fichaje.tipo === 'finDescanso' ? 'secondary' : (fichaje.tipo === 'salida' ? 'destructive' : 'default')} className="capitalize">
                            {fichaje.tipo.replace('inicioD', 'Ini. D').replace('finD', 'Fin D')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fichaje.validado ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100/90"><CheckCircle className="mr-1 h-4 w-4"/>Validado</Badge> : <Badge variant="outline" className="border-amber-500 text-amber-600"><ShieldAlert className="mr-1 h-4 w-4"/>Pendiente</Badge>}
                      </TableCell>
                      <TableCell>{fichaje.validadoPor ? (usuariosMap[fichaje.validadoPor] || 'N/A') : '-'}</TableCell>
                      <TableCell>
                        {!fichaje.validado && (currentUser?.rol === 'admin' || currentUser?.rol === 'jefeObra') && (
                          <Button size="sm" variant="outline" onClick={() => handleValidateFichaje(fichaje.id)} disabled={isSubmitting} className="text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700">
                            {isSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Validar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
