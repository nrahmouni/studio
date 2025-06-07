
// src/app/(app)/fichajes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, LogIn, LogOut, Coffee, Briefcase, AlertTriangle, Info } from 'lucide-react';
import { getUsuarioById } from '@/lib/actions/user.actions';
import { getObraById } from '@/lib/actions/obra.actions';
import { createFichaje, getFichajesHoyUsuarioObra } from '@/lib/actions/fichaje.actions';
import type { UsuarioFirebase, Obra, Fichaje, FichajeTipo } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type FichajeStatus = 'no_fichado' | 'trabajando' | 'en_descanso';

export default function FichajesPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UsuarioFirebase | null>(null);
  const [userObras, setUserObras] = useState<Obra[]>([]);
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([]);
  const [currentStatus, setCurrentStatus] = useState<FichajeStatus>('no_fichado');
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingObras, setIsLoadingObras] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current user and their obras
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingUser(true);
      setError(null);
      const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');
      if (!storedUsuarioId) {
        setError("Usuario no identificado. Por favor, inicia sesión de nuevo.");
        setIsLoadingUser(false);
        return;
      }

      try {
        const user = await getUsuarioById(storedUsuarioId);
        setCurrentUser(user);
        if (user && user.obrasAsignadas && user.obrasAsignadas.length > 0) {
          setIsLoadingObras(true);
          const obrasPromises = user.obrasAsignadas.map(id => getObraById(id, user.empresaId));
          const fetchedObras = (await Promise.all(obrasPromises)).filter(Boolean) as Obra[];
          const activeObras = fetchedObras.filter(o => !o.fechaFin || new Date(o.fechaFin) >= new Date());
          setUserObras(activeObras);
          if (activeObras.length > 0) {
            // Try to load persisted obra selection or default to first
            const persistedObraId = localStorage.getItem('fichaje_selectedObraId');
            if (persistedObraId && activeObras.some(o => o.id === persistedObraId)) {
              setSelectedObraId(persistedObraId);
            } else {
              setSelectedObraId(activeObras[0].id);
            }
          } else {
            setError("No tienes obras activas asignadas para fichar.");
          }
          setIsLoadingObras(false);
        } else if (user) {
          setError("No tienes obras asignadas para fichar.");
        } else {
           setError("No se pudo cargar la información del usuario.");
        }
      } catch (e) {
        setError("Error al cargar datos iniciales.");
        console.error(e);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadInitialData();
  }, []);

  // Load fichaje status when selectedObraId or currentUser changes
  useEffect(() => {
    if (!currentUser || !selectedObraId) {
      setCurrentStatus('no_fichado');
      setFichajesHoy([]);
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
            case 'entrada':
            case 'finDescanso':
              setCurrentStatus('trabajando');
              break;
            case 'inicioDescanso':
              setCurrentStatus('en_descanso');
              break;
            case 'salida':
              setCurrentStatus('no_fichado');
              break;
          }
        } else {
          setCurrentStatus('no_fichado');
          setLastActionTime(null);
        }
      } catch (e) {
        setError("Error al cargar el estado de fichaje.");
        toast({ title: "Error", description: "No se pudo obtener el estado de fichaje.", variant: "destructive" });
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchStatus();
  }, [currentUser, selectedObraId, toast]);

  const handleObraChange = (obraId: string) => {
    setSelectedObraId(obraId);
    localStorage.setItem('fichaje_selectedObraId', obraId);
  };

  const handleFichajeAction = async (tipo: FichajeTipo) => {
    if (!currentUser || !selectedObraId) {
      toast({ title: "Error", description: "Usuario u obra no seleccionados.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createFichaje({ usuarioId: currentUser.id, obraId: selectedObraId, tipo });
      if (result.success && result.fichaje) {
        toast({ title: "Acción Registrada", description: `Fichaje de ${tipo} realizado con éxito.` });
        // Refetch status
        const hoy = await getFichajesHoyUsuarioObra(currentUser.id, selectedObraId);
        setFichajesHoy(hoy);
        if (hoy.length > 0) {
          const ultimoFichaje = hoy[hoy.length - 1];
          setLastActionTime(ultimoFichaje.timestamp);
          switch (ultimoFichaje.tipo) {
            case 'entrada':
            case 'finDescanso':
              setCurrentStatus('trabajando');
              break;
            case 'inicioDescanso':
              setCurrentStatus('en_descanso');
              break;
            case 'salida':
              setCurrentStatus('no_fichado');
              break;
          }
        } else {
           setCurrentStatus('no_fichado');
           setLastActionTime(null);
        }
      } else {
        toast({ title: "Error al Fichar", description: result.message || "No se pudo registrar la acción.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error al fichar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedObraNombre = userObras.find(o => o.id === selectedObraId)?.nombre || "Desconocida";

  if (isLoadingUser) {
    return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">Cargando información de usuario...</p></div>;
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
  
  const canSelectObra = currentStatus === 'no_fichado' && userObras.length > 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto shadow-xl animate-fade-in-up">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Sistema de Fichaje</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Registra tu jornada laboral.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isLoadingObras ? (
            <div className="flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Cargando obras...</div>
          ) : userObras.length === 0 && !error ? (
             <Card className="bg-muted/50 border-muted p-4">
                <CardHeader className="p-0 mb-2"><CardTitle className="text-md flex items-center"><Info className="mr-2 h-5 w-5 text-primary" />No hay Obras</CardTitle></CardHeader>
                <CardContent className="p-0 text-sm">No tienes obras activas asignadas. Contacta con tu administrador.</CardContent>
            </Card>
          ) : (
            <div>
              <label htmlFor="obraSelect" className="block text-sm font-medium text-foreground mb-1">Obra Actual:</label>
              <Select
                value={selectedObraId}
                onValueChange={handleObraChange}
                disabled={!canSelectObra || isSubmitting}
              >
                <SelectTrigger id="obraSelect" className="w-full">
                  <SelectValue placeholder="Selecciona una obra" />
                </SelectTrigger>
                <SelectContent>
                  {userObras.map(obra => (
                    <SelectItem key={obra.id} value={obra.id}>{obra.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {!canSelectObra && selectedObraId && <p className="text-xs text-muted-foreground mt-1">Para cambiar de obra, primero debes fichar salida.</p>}
            </div>
          )}

          {isLoadingStatus ? (
             <div className="flex items-center justify-center py-4"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Actualizando estado...</div>
          ) : (
            <Card className="bg-secondary/20 p-4 border-dashed border-secondary">
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-lg font-semibold text-primary">Estado Actual</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-md">
                {currentStatus === 'no_fichado' && <p>No has fichado entrada en <span className="font-semibold">{selectedObraNombre}</span>.</p>}
                {currentStatus === 'trabajando' && <p>Trabajando en <span className="font-semibold">{selectedObraNombre}</span> desde {lastActionTime ? format(lastActionTime, 'HH:mm', { locale: es }) : ''}.</p>}
                {currentStatus === 'en_descanso' && <p>En descanso (en <span className="font-semibold">{selectedObraNombre}</span>) desde {lastActionTime ? format(lastActionTime, 'HH:mm', { locale: es }) : ''}.</p>}
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {currentStatus === 'no_fichado' && (
              <Button onClick={() => handleFichajeAction('entrada')} className="w-full text-lg py-6 bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting || isLoadingStatus || !selectedObraId}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <LogIn className="mr-2 h-5 w-5"/>} Fichar Entrada
              </Button>
            )}
            {currentStatus === 'trabajando' && (
              <>
                <Button onClick={() => handleFichajeAction('inicioDescanso')} className="w-full text-lg py-6 bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting || isLoadingStatus}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Coffee className="mr-2 h-5 w-5"/>} Marcar Descanso
                </Button>
                <Button onClick={() => handleFichajeAction('salida')} className="w-full text-lg py-6 bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting || isLoadingStatus}>
                 {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <LogOut className="mr-2 h-5 w-5"/>} Fichar Salida
                </Button>
              </>
            )}
            {currentStatus === 'en_descanso' && (
              <Button onClick={() => handleFichajeAction('finDescanso')} className="w-full text-lg py-6 bg-sky-500 hover:bg-sky-600 text-white" disabled={isSubmitting || isLoadingStatus}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <LogIn className="mr-2 h-5 w-5"/>} Volver de Descanso
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-6 text-center border-t">
            <p className="text-xs text-muted-foreground">
                Hoy es {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}.
                {currentUser && ` Bienvenido, ${currentUser.nombre.split(' ')[0]}.`}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
