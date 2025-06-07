// src/app/(app)/obras/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Briefcase, CalendarDays, User, Building, Edit3, ArrowLeft, AlertTriangle } from "lucide-react";
import { getObraById } from '@/lib/actions/obra.actions';
import { getUsuarioById } from '@/lib/actions/user.actions';
import type { Obra, UsuarioFirebase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';

export default function ObraDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const obraId = params.id as string;

  const [obra, setObra] = useState<Obra | null>(null);
  const [jefeObra, setJefeObra] = useState<UsuarioFirebase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObraDetails = async () => {
      if (!obraId) return;
      setIsLoading(true);
      setError(null);
      const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
      if (!storedEmpresaId) {
        toast({ title: "Error", description: "ID de empresa no encontrado.", variant: "destructive" });
        setError("ID de empresa no disponible.");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedObra = await getObraById(obraId, storedEmpresaId);
        if (fetchedObra) {
          setObra(fetchedObra);
          if (fetchedObra.jefeObraId) {
            const fetchedJefe = await getUsuarioById(fetchedObra.jefeObraId);
            setJefeObra(fetchedJefe);
          }
        } else {
          setError("Obra no encontrada o no tienes acceso a ella.");
          toast({ title: "Error", description: "Obra no encontrada.", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching obra details:", err);
        setError("No se pudo cargar la información de la obra.");
        toast({ title: "Error de Carga", description: "Error al cargar detalles de la obra.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchObraDetails();
  }, [obraId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Cargando detalles de la obra...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-destructive/10 border-destructive text-destructive">
          <CardHeader>
            <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error</CardTitle>
          </CardHeader>
          <CardContent><p>{error}</p></CardContent>
           <CardFooter>
             <Button variant="outline" onClick={() => router.push('/obras')} className="border-destructive text-destructive hover:bg-destructive/20">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Obras
            </Button>
           </CardFooter>
        </Card>
      </div>
    );
  }

  if (!obra) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">No se encontró la obra especificada.</p>
        <Button onClick={() => router.push('/obras')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Obras
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.push('/obras')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado de Obras
      </Button>
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <Image
                src={obra.dataAIHint ? `https://placehold.co/120x90.png` : "https://placehold.co/120x90.png"}
                alt={`Imagen de ${obra.nombre}`}
                width={120}
                height={90}
                className="rounded-md border object-cover"
                data-ai-hint={obra.dataAIHint || "construction site"}
              />
              <div>
                <CardTitle className="text-3xl font-bold font-headline text-primary">{obra.nombre}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{obra.direccion}</CardDescription>
              </div>
            </div>
            <Link href={`/obras/${obra.id}/edit`} passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Edit3 className="mr-2 h-5 w-5" /> Editar Obra
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid md:grid-cols-2 gap-6">
          <InfoItem icon={<Building className="text-accent" />} label="Cliente" value={obra.clienteNombre} />
          <InfoItem icon={<CalendarDays className="text-accent" />} label="Fecha de Inicio" value={new Date(obra.fechaInicio).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <InfoItem icon={<CalendarDays className="text-accent" />} label="Fecha de Fin Prevista" value={obra.fechaFin ? new Date(obra.fechaFin).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'En curso'} />
          {jefeObra && <InfoItem icon={<User className="text-accent" />} label="Jefe de Obra" value={jefeObra.nombre} />}
          
          <div className="md:col-span-2">
            <h4 className="font-semibold text-md mb-2 text-primary/90">Descripción Adicional / Notas:</h4>
            <p className="text-sm text-foreground/80 p-3 bg-muted/30 rounded-md border border-border min-h-[80px]">
              {obra.descripcion || 'No hay descripción adicional para esta obra.'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-6 border-t">
           <p className="text-xs text-muted-foreground">ID Obra: {obra.id}</p>
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
