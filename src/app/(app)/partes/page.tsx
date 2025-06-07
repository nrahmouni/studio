// src/app/(app)/partes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Loader2, AlertTriangle, Eye, CheckCircle, ShieldAlert, Filter } from "lucide-react";
import Link from "next/link";
import { getPartesByEmpresaYObra, validateParte } from '@/lib/actions/parte.actions';
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import type { Parte, Obra, UsuarioFirebase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsuarioById } from '@/lib/actions/user.actions';
import Image from 'next/image';

export default function PartesPage() {
  const [partes, setPartes] = useState<Parte[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [usuariosMap, setUsuariosMap] = useState<Record<string, string>>({});
  const [obrasMap, setObrasMap] = useState<Record<string, string>>({});
  const [selectedObraId, setSelectedObraId] = useState<string | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UsuarioFirebase | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      setError(null);
      const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
      const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');

      if (!storedEmpresaId) {
        setError("ID de empresa no encontrado. Por favor, inicie sesión de nuevo.");
        setIsLoading(false);
        toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
        return;
      }

      if (storedUsuarioId) {
        try {
            const user = await getUsuarioById(storedUsuarioId);
            setCurrentUser(user);
        } catch (e) {
            console.error("Error fetching current user", e);
        }
      }


      try {
        const [fetchedObras, fetchedPartes] = await Promise.all([
          getObrasByEmpresaId(storedEmpresaId),
          getPartesByEmpresaYObra(storedEmpresaId, selectedObraId === 'all' ? undefined : selectedObraId)
        ]);
        
        setObras(fetchedObras);
        const tempObrasMap: Record<string, string> = {};
        fetchedObras.forEach(o => tempObrasMap[o.id] = o.nombre);
        setObrasMap(tempObrasMap);

        // Sort partes by date descending
        fetchedPartes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setPartes(fetchedPartes);

        const userIds = new Set(fetchedPartes.map(p => p.usuarioId).concat(fetchedPartes.filter(p=>p.validadoPor).map(p => p.validadoPor!)));
        const usersPromises = Array.from(userIds).map(id => getUsuarioById(id));
        const usersData = await Promise.all(usersPromises);
        const tempUsuariosMap: Record<string, string> = {};
        usersData.forEach(u => { if (u) tempUsuariosMap[u.id] = u.nombre; });
        setUsuariosMap(tempUsuariosMap);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No se pudieron cargar los datos. Inténtelo de nuevo más tarde.");
        toast({ title: "Error de Carga", description: "No se pudieron cargar los datos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [toast, selectedObraId]);

  const handleValidateParte = async (parteId: string) => {
    if (!currentUser || (currentUser.rol !== 'admin' && currentUser.rol !== 'jefeObra')) {
        toast({ title: "No autorizado", description: "No tienes permiso para validar partes.", variant: "destructive" });
        return;
    }
    if (!currentUser.empresaId) {
        toast({ title: "Error", description: "No se pudo identificar tu empresa.", variant: "destructive" });
        return;
    }

    try {
        const result = await validateParte(parteId, currentUser.id);
        if (result.success && result.parte) {
            toast({ title: "Parte Validado", description: `El parte ha sido validado con éxito.` });
            setPartes(prevPartes => prevPartes.map(p => p.id === parteId ? { ...p, validado: true, validadoPor: currentUser.id } : p));
        } else {
            toast({ title: "Error al Validar", description: result.message, variant: "destructive" });
        }
    } catch (e) {
        toast({ title: "Error", description: "Ocurrió un error al validar el parte.", variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Partes de Trabajo
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={selectedObraId} onValueChange={setSelectedObraId}>
            <SelectTrigger className="w-full sm:w-[250px] bg-card">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filtrar por obra..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Obras</SelectItem>
              {obras.map(obra => (
                <SelectItem key={obra.id} value={obra.id}>{obra.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/partes/new" passHref>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nuevo Parte
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Cargando partes...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive">
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      )}

      {!isLoading && !error && partes.length === 0 && (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-3 h-6 w-6 text-primary" />
              <span>Listado de Partes de Trabajo</span>
            </CardTitle>
            <CardDescription>
              Consulta y gestiona los partes de trabajo diarios de tus obras.
              {selectedObraId !== 'all' && obrasMap[selectedObraId] ? ` Actualmente filtrando por: ${obrasMap[selectedObraId]}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg mb-2">Aún no hay partes de trabajo registrados {selectedObraId !== 'all' ? 'para esta obra' : 'que coincidan con el filtro'}.</p>
              <p>Crea tu primer parte para empezar.</p>
              <Link href="/partes/new" passHref className="mt-4 inline-block">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Registrar Nuevo Parte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && partes.length > 0 && (
        <>
        <p className="text-muted-foreground mb-6">
            Mostrando {partes.length} parte(s).
            {selectedObraId !== 'all' && obrasMap[selectedObraId] ? ` Filtrado por: ${obrasMap[selectedObraId]}.` : ''}
        </p>
        <div className="space-y-6">
          {partes.map(parte => {
            const fotosURLs = parte.fotosURLs;
            return (
              <Card key={parte.id} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-headline text-primary hover:underline">
                         <Link href={`/partes/${parte.id}`}>Parte del {new Date(parte.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</Link>
                      </CardTitle>
                      <CardDescription>
                        Obra: <span className="font-medium text-foreground">{obrasMap[parte.obraId] || 'Desconocida'}</span>
                         <span className="mx-1">|</span> 
                        Trabajador: <span className="font-medium text-foreground">{usuariosMap[parte.usuarioId] || 'Desconocido'}</span>
                      </CardDescription>
                    </div>
                    {parte.validado ? (
                        <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle className="h-4 w-4 mr-1" /> Validado
                        </span>
                      ) : (
                         <span className="flex items-center text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                          <ShieldAlert className="h-4 w-4 mr-1" /> Pendiente
                        </span>
                      )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-2">
                  <div>
                      <h4 className="font-semibold text-sm">Tareas Realizadas:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{parte.tareasRealizadas}</p>
                  </div>
                  {parte.incidencias && (
                    <div>
                      <h4 className="font-semibold text-sm">Incidencias:</h4>
                      <p className="text-sm text-destructive/80 line-clamp-1">{parte.incidencias}</p>
                    </div>
                  )}
                  {fotosURLs && fotosURLs.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {fotosURLs.slice(0,3).map((url, idx) => (
                         <Image key={idx} src={url} alt={`Foto ${idx+1} del parte`} width={60} height={60} className="rounded-md object-cover border" data-ai-hint={parte.dataAIHint || "construction work"}/>
                      ))}
                      {fotosURLs.length > 3 && <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground border">+{fotosURLs.length - 3} más</div>}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                  {!parte.validado && currentUser && (currentUser.rol === 'admin' || currentUser.rol === 'jefeObra') && (
                       <Button onClick={() => handleValidateParte(parte.id)} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Validar
                      </Button>
                  )}
                  {parte.validado && parte.validadoPor && (
                      <p className="text-xs text-muted-foreground italic">Validado por {usuariosMap[parte.validadoPor] || 'Admin'}</p>
                  )}
                  <Link href={`/partes/${parte.id}`} passHref>
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Eye className="mr-2 h-4 w-4" /> Ver Parte
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
