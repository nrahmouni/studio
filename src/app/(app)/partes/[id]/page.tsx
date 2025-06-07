// src/app/(app)/partes/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, CalendarDays, User, Briefcase, CheckCircle, ShieldAlert, AlertTriangle, ArrowLeft, Camera, Edit3 } from "lucide-react";
import { getParteById, validateParte } from '@/lib/actions/parte.actions';
import { getObraById } from '@/lib/actions/obra.actions';
import { getUsuarioById } from '@/lib/actions/user.actions';
import type { Parte, Obra, UsuarioFirebase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function ParteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const parteId = params.id as string;

  const [parte, setParte] = useState<Parte | null>(null);
  const [obra, setObra] = useState<Obra | null>(null);
  const [trabajador, setTrabajador] = useState<UsuarioFirebase | null>(null);
  const [validador, setValidador] = useState<UsuarioFirebase | null>(null);
  const [currentUser, setCurrentUser] = useState<UsuarioFirebase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParteDetails = async () => {
      if (!parteId) return;
      setIsLoading(true);
      setError(null);
      
      const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
      const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');

      if (!storedEmpresaId) {
        toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
        setError("ID de empresa no disponible.");
        setIsLoading(false);
        return;
      }
      if (storedUsuarioId) {
        try {
            const user = await getUsuarioById(storedUsuarioId);
            setCurrentUser(user);
        } catch (e) { console.error("Error fetching current user", e); }
      }

      try {
        const fetchedParte = await getParteById(parteId, storedEmpresaId);
        if (fetchedParte) {
          setParte(fetchedParte);
          // Fetch related data in parallel
          const [fetchedObra, fetchedTrabajador, fetchedValidador] = await Promise.all([
            getObraById(fetchedParte.obraId, storedEmpresaId),
            getUsuarioById(fetchedParte.usuarioId),
            fetchedParte.validadoPor ? getUsuarioById(fetchedParte.validadoPor) : Promise.resolve(null)
          ]);
          setObra(fetchedObra);
          setTrabajador(fetchedTrabajador);
          setValidador(fetchedValidador);

        } else {
          setError("Parte no encontrado o no tienes acceso a él.");
          toast({ title: "Error", description: "Parte no encontrado.", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching parte details:", err);
        setError("No se pudo cargar la información del parte.");
        toast({ title: "Error de Carga", description: "Error al cargar detalles del parte.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchParteDetails();
  }, [parteId, toast]);

  const handleValidate = async () => {
    if (!parte || !currentUser || !currentUser.id || (currentUser.rol !== 'admin' && currentUser.rol !== 'jefeObra')) {
        toast({ title: "No Autorizado", description: "No tienes permisos para validar este parte.", variant: "destructive" });
        return;
    }
    try {
        const result = await validateParte(parte.id, currentUser.id);
        if (result.success && result.parte) {
            setParte(result.parte);
            if (result.parte.validadoPor) {
                const fetchedValidador = await getUsuarioById(result.parte.validadoPor);
                setValidador(fetchedValidador);
            }
            toast({ title: "Parte Validado", description: "El parte ha sido marcado como validado." });
        } else {
            toast({ title: "Error al Validar", description: result.message || "No se pudo validar el parte.", variant: "destructive" });
        }
    } catch (e) {
        toast({ title: "Error", description: "Ocurrió un error durante la validación.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-8rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-4 text-lg">Cargando detalles del parte...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-destructive/10 border-destructive text-destructive"><CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent>
        <CardFooter><Button variant="outline" onClick={() => router.push('/partes')} className="border-destructive text-destructive hover:bg-destructive/20"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Partes</Button></CardFooter></Card>
      </div>
    );
  }

  if (!parte || !obra || !trabajador) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">No se encontró el parte o falta información asociada.</p>
        <Button onClick={() => router.push('/partes')} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Volver a Partes</Button>
      </div>
    );
  }

  const tareasSeleccionadas = parte.tareasSeleccionadas;
  const fotosURLs = parte.fotosURLs;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.push('/partes')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado de Partes
      </Button>
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold font-headline text-primary">
                Parte del {new Date(parte.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Obra: <Link href={`/obras/${obra.id}`} className="hover:underline text-primary/80">{obra.nombre}</Link>
              </CardDescription>
            </div>
            {parte.validado ? (
                <span className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full font-medium mt-2 sm:mt-0">
                    <CheckCircle className="h-5 w-5 mr-2" /> Validado
                    {validador && <span className="ml-1 text-xs text-green-600">(por {validador.nombre})</span>}
                </span>
            ) : (
                <span className="flex items-center text-sm text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full font-medium mt-2 sm:mt-0">
                    <ShieldAlert className="h-5 w-5 mr-2" /> Pendiente de Validación
                </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <InfoItem icon={<User className="text-accent" />} label="Trabajador" value={trabajador.nombre} />
            <InfoItem icon={<Briefcase className="text-accent" />} label="Obra" value={obra.direccion} />
            <InfoItem icon={<CalendarDays className="text-accent" />} label="Fecha de Registro" value={new Date(parte.timestamp).toLocaleString('es-ES')} />
          </div>

          <div>
            <h4 className="font-semibold text-md mb-1 text-primary/90">Tareas Realizadas:</h4>
            <p className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-md border whitespace-pre-wrap">{parte.tareasRealizadas}</p>
          </div>

          {parte.incidencias && (
            <div>
              <h4 className="font-semibold text-md mb-1 text-primary/90">Incidencias:</h4>
              <p className="text-sm text-destructive/90 p-3 bg-destructive/5 rounded-md border border-destructive/20 whitespace-pre-wrap">{parte.incidencias}</p>
            </div>
          )}
          
          {tareasSeleccionadas && tareasSeleccionadas.length > 0 && (
            <div>
                <h4 className="font-semibold text-md mb-1 text-primary/90">Tipos de Tarea:</h4>
                <div className="flex flex-wrap gap-2">
                    {tareasSeleccionadas.map(tarea => (
                        <span key={tarea} className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">{tarea}</span>
                    ))}
                </div>
            </div>
          )}

          {fotosURLs && fotosURLs.length > 0 && (
            <div>
              <h4 className="font-semibold text-md mb-2 text-primary/90 flex items-center"><Camera className="mr-2 h-5 w-5 text-accent"/>Fotos Adjuntas:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {fotosURLs.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                    <Image 
                        src={url} 
                        alt={`Foto ${index + 1} del parte`} 
                        width={200} 
                        height={150} 
                        className="rounded-md object-cover border shadow-sm aspect-[4/3]"
                        data-ai-hint={parte.dataAIHint || "work evidence"}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {parte.firmaURL && (
             <div>
                <h4 className="font-semibold text-md mb-1 text-primary/90">Firma:</h4>
                <Image src={parte.firmaURL} alt="Firma del trabajador" width={200} height={100} className="border rounded-md bg-white p-2" data-ai-hint="signature" />
             </div>
          )}

        </CardContent>
        <CardFooter className="p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">ID Parte: {parte.id}</p>
            <div className="flex gap-3">
                {/* <Button variant="outline" disabled><Edit3 className="mr-2 h-4 w-4"/> Editar Parte (Próximamente)</Button> */}
                {!parte.validado && currentUser && (currentUser.rol === 'admin' || currentUser.rol === 'jefeObra') && (
                    <Button onClick={handleValidate} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="mr-2 h-4 w-4" /> Validar Parte
                    </Button>
                )}
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-card rounded-md border">
      <div className="flex-shrink-0 pt-1">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-md font-semibold text-foreground">{value || 'No especificado'}</p>
      </div>
    </div>
  );
}
