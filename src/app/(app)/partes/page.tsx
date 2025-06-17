
// src/app/(app)/partes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusCircle, Loader2, AlertTriangle, Eye, CheckCircle, ShieldAlert, Filter, FileDown, Info } from "lucide-react";
import Link from "next/link";
import { getPartesByEmpresaYObra, validateParte } from '@/lib/actions/parte.actions';
import { getObrasByEmpresaId } from '@/lib/actions/obra.actions';
import type { Parte, Obra, UsuarioFirebase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsuarioById } from '@/lib/actions/user.actions';
import Image from 'next/image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        toast({ title: "Error de Autenticación", description: "ID de empresa no disponible.", variant: "destructive" });
        return;
      }

      if (storedUsuarioId) {
        try {
            const user = await getUsuarioById(storedUsuarioId);
            setCurrentUser(user);
        } catch (e) {
            console.error("Error fetching current user", e);
             toast({ title: "Error de Usuario", description: "No se pudo cargar la información del usuario actual.", variant: "destructive" });
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

        fetchedPartes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setPartes(fetchedPartes);

        const userIdsInPartes = new Set(fetchedPartes.map(p => p.usuarioId));
        const validatorIdsInPartes = new Set(fetchedPartes.map(p => p.validadoPor).filter(Boolean) as string[]);
        const allUserIds = new Set([...userIdsInPartes, ...validatorIdsInPartes]);


        if (allUserIds.size > 0) {
            const usersPromises = Array.from(allUserIds).map(id => getUsuarioById(id));
            const usersData = await Promise.all(usersPromises);
            const tempUsuariosMap: Record<string, string> = {};
            usersData.forEach(u => { if (u) tempUsuariosMap[u.id] = u.nombre; });
            setUsuariosMap(prev => ({...prev, ...tempUsuariosMap}));
        }


      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No se pudieron cargar los datos de los partes. Inténtelo de nuevo más tarde.");
        toast({ title: "Error de Carga", description: "No se pudieron cargar los partes de trabajo.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [toast, selectedObraId]);

  const handleValidateParte = async (parteId: string, parteFecha: Date, trabajadorNombre?: string) => {
    if (!currentUser || (currentUser.rol !== 'admin' && currentUser.rol !== 'jefeObra')) {
        toast({ title: "Acción No Autorizada", description: "No tienes los permisos necesarios para validar partes.", variant: "destructive" });
        return;
    }
    if (!currentUser.empresaId) {
        toast({ title: "Error de Sistema", description: "No se pudo identificar tu empresa para la validación.", variant: "destructive" });
        return;
    }

    try {
        const result = await validateParte(parteId, currentUser.id);
        if (result.success && result.parte) {
            const fechaFormateada = new Date(parteFecha).toLocaleDateString('es-ES');
            toast({ title: "Parte Validado", description: `El parte de ${trabajadorNombre || 'trabajador'} del ${fechaFormateada} ha sido validado.` });
            setPartes(prevPartes => prevPartes.map(p => p.id === parteId ? { ...p, validado: true, validadoPor: currentUser.id } : p));
             if (currentUser && !usuariosMap[currentUser.id]) {
              setUsuariosMap(prevMap => ({ ...prevMap, [currentUser.id!]: currentUser.nombre }));
            }
        } else {
            toast({ title: "Error al Validar", description: result.message || "No se pudo completar la validación del parte.", variant: "destructive" });
        }
    } catch (e) {
        toast({ title: "Error Inesperado", description: "Ocurrió un error durante el proceso de validación.", variant: "destructive" });
    }
  };

  const handleGenerateIndividualPartePDF = (parte: Parte) => {
    const doc = new jsPDF();
    const obraNombre = obrasMap[parte.obraId] || 'Obra Desconocida';
    const trabajadorNombre = usuariosMap[parte.usuarioId] || 'Trabajador Desconocido';
    const validadorNombre = parte.validadoPor ? (usuariosMap[parte.validadoPor] || 'Sistema') : 'N/A';

    doc.setFontSize(18);
    doc.text("Parte de Trabajo Diario", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100); 
    doc.text(`Obra: ${obraNombre}`, 14, 32);
    doc.text(`Trabajador: ${trabajadorNombre}`, 14, 38);
    doc.text(`Fecha: ${new Date(parte.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 44);
    
    let startY = 52;
    
    const tableData: (string | number | null)[][] = [
      ["Horas Trabajadas", parte.horasTrabajadas != null ? `${parte.horasTrabajadas}h` : 'N/A'],
      ["Tareas Realizadas", parte.tareasRealizadas],
      ["Incidencias", parte.incidencias || "Ninguna"],
      ["Estado", parte.validado ? `Validado por ${validadorNombre}` : "Pendiente de Validación"],
    ];

    if (parte.tareasSeleccionadas && parte.tareasSeleccionadas.length > 0) {
      tableData.push(["Tipos de Tarea", parte.tareasSeleccionadas.join(', ')]);
    }
    if (parte.firmaURL) {
      tableData.push(["Firma (Ver online)", parte.firmaURL]);
    }
    if (parte.fotosURLs && parte.fotosURLs.length > 0) {
      tableData.push(["Fotos Adjuntas (Ver online)", parte.fotosURLs.join('\n')]); 
    }
    
    autoTable(doc, {
      startY: startY,
      head: [["Detalle", "Información"]],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [41, 75, 109], textColor: 255, fontStyle: 'bold' }, 
      alternateRowStyles: { fillColor: [240, 244, 248] }, 
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' }, 
        1: { cellWidth: 'auto' }, 
      },
      didParseCell: function (data) {
        if (data.column.dataKey === 1) { 
            if (typeof data.cell.raw === 'string' && data.cell.raw.includes('https://')) {
                 data.cell.styles.fontSize = 7; 
            }
        }
      }
    });

    doc.save(`Parte_${trabajadorNombre.replace(/\s+/g, '_')}_${new Date(parte.fecha).toISOString().split('T')[0]}.pdf`);
    toast({
      title: "PDF Generado",
      description: "El parte de trabajo individual se ha descargado.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-down">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Partes de Trabajo
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={selectedObraId} onValueChange={setSelectedObraId} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-[250px] bg-card">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={isLoading ? "Cargando obras..." : "Filtrar por obra"} />
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
              Registrar Parte
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Cargando partes de trabajo...</p>
        </div>
      )}

      {error && !isLoading && (
        <Card className="bg-destructive/10 border-destructive text-destructive animate-fade-in-up">
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6" />Error al Cargar Partes</CardTitle></CardHeader>
          <CardContent><p>{error}</p></CardContent>
        </Card>
      )}

      {!isLoading && !error && partes.length === 0 && (
         <Card className="shadow-lg animate-fade-in-up border-dashed">
          <CardHeader className="items-center text-center p-8">
             <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <Info className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline text-primary">No Hay Partes de Trabajo</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {selectedObraId !== 'all' && obrasMap[selectedObraId] 
                ? `No se encontraron partes para la obra "${obrasMap[selectedObraId]}".` 
                : 'Actualmente no hay partes de trabajo registrados que coincidan con tu filtro.'}
              <br/>
              Puedes registrar un nuevo parte o ajustar los filtros.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Link href="/partes/new" passHref>
              <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                 <PlusCircle className="mr-2 h-5 w-5" /> Registrar Nuevo Parte
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && partes.length > 0 && (
        <>
        <p className="text-muted-foreground mb-6 animate-fade-in-down">
            Mostrando {partes.length} parte(s).
            {selectedObraId !== 'all' && obrasMap[selectedObraId] ? ` Filtrado por: ${obrasMap[selectedObraId]}.` : ''}
        </p>
        <div className="space-y-6">
          {partes.map((parte, index) => {
            const fotosURLs = parte.fotosURLs;
            const trabajadorNombre = usuariosMap[parte.usuarioId] || 'Desconocido';
            return (
              <Card 
                key={parte.id} 
                className={`card-interactive animate-fade-in-up animation-delay-${(index + 1) * 100} border hover:border-primary/30`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <CardTitle className="text-xl font-headline text-primary hover:underline">
                         <Link href={`/partes/${parte.id}`}>Parte del {new Date(parte.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</Link>
                      </CardTitle>
                      <CardDescription>
                        Obra: <span className="font-medium text-foreground">{obrasMap[parte.obraId] || 'Desconocida'}</span>
                         <span className="mx-1">|</span> 
                        Trabajador: <span className="font-medium text-foreground">{trabajadorNombre}</span>
                      </CardDescription>
                    </div>
                    {parte.validado ? (
                        <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                          <CheckCircle className="h-4 w-4 mr-1" /> Validado
                        </span>
                      ) : (
                         <span className="flex items-center text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full font-medium">
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
                         <Image key={idx} src={url} alt={`Foto ${idx+1} del parte`} width={60} height={60} className="rounded-md object-cover border" data-ai-hint={parte.dataAIHint || "work evidence"}/>
                      ))}
                      {fotosURLs.length > 3 && <div className="w-[60px] h-[60px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground border">+{fotosURLs.length - 3} más</div>}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-3 border-t">
                  {!parte.validado && currentUser && (currentUser.rol === 'admin' || currentUser.rol === 'jefeObra') && (
                       <Button onClick={() => handleValidateParte(parte.id, parte.fecha, trabajadorNombre)} variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" /> Validar
                      </Button>
                  )}
                  {parte.validado && parte.validadoPor && (
                      <p className="text-xs text-muted-foreground italic mr-auto">Validado por {usuariosMap[parte.validadoPor] || 'Admin'}</p>
                  )}
                  <Button onClick={() => handleGenerateIndividualPartePDF(parte)} variant="outline" size="sm" className="text-primary border-primary/50 hover:bg-primary/10">
                    <FileDown className="mr-2 h-4 w-4" /> Descargar PDF
                  </Button>
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
