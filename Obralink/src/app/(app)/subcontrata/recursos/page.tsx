'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Trash2, Truck, UserPlus } from 'lucide-react';
import { getTrabajadoresBySubcontrata, getMaquinariaBySubcontrata, removeTrabajador, removeMaquinaria } from '@/lib/actions/app.actions';
import type { Trabajador, Maquinaria } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddPersonalDialog } from '@/components/dashboards/AddPersonalDialog';
import { AddMaquinariaDialog } from '@/components/dashboards/AddMaquinariaDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function RecursosPage() {
  const [personal, setPersonal] = useState<Trabajador[]>([]);
  const [maquinaria, setMaquinaria] = useState<Maquinaria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
      toast({ title: "Error", description: "No se pudo identificar la subcontrata.", variant: "destructive" });
      setLoading(false);
      return;
    }
    
    const [personalData, maquinariaData] = await Promise.all([
      getTrabajadoresBySubcontrata(subcontrataId),
      getMaquinariaBySubcontrata(subcontrataId),
    ]);
    setPersonal(personalData);
    setMaquinaria(maquinariaData);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onPersonalAdded = useCallback((newPersonal: Trabajador) => {
    setPersonal(prev => [...prev, newPersonal]);
  }, []);

  const onMaquinariaAdded = useCallback((newMaquinaria: Maquinaria) => {
    setMaquinaria(prev => [...prev, newMaquinaria]);
  }, []);

  const handleRemovePersonal = async (trabajadorId: string) => {
    const result = await removeTrabajador(trabajadorId);
    if (result.success) {
      toast({ title: "Éxito", description: `Personal eliminado.` });
      setPersonal(prev => prev.filter(p => p.id !== trabajadorId));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleRemoveMaquinaria = async (maquinariaId: string) => {
    const result = await removeMaquinaria(maquinariaId);
    if (result.success) {
      toast({ title: "Éxito", description: `Maquinaria eliminada.` });
      setMaquinaria(prev => prev.filter(m => m.id !== maquinariaId));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const CategoriaMapping: Record<string, string> = {
    oficial: 'Oficial',
    peon: 'Peón',
    maquinista: 'Maquinista',
    encofrador: 'Encofrador',
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Gestión de Recursos</h1>
        <p className="text-muted-foreground mt-1">Administra el personal y la maquinaria de tu empresa.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="maquinaria">Maquinaria</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal de la Empresa</CardTitle>
                <CardDescription>Añade y gestiona a tus trabajadores.</CardDescription>
              </div>
              <AddPersonalDialog onPersonalAdded={onPersonalAdded}>
                 <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><UserPlus className="mr-2 h-4 w-4"/> Añadir Personal</Button>
              </AddPersonalDialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {personal.length > 0 ? personal.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{p.nombre}</p>
                      <p className="text-sm text-muted-foreground capitalize">{p.categoriaProfesional ? CategoriaMapping[p.categoriaProfesional] : 'Sin categoría'}</p>
                    </div>
                  </div>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-5 w-5"/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al trabajador de tu empresa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemovePersonal(p.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              )) : (
                 <p className="text-center py-6 text-muted-foreground">No hay personal registrado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maquinaria">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maquinaria y Vehículos</CardTitle>
                <CardDescription>Añade y gestiona la maquinaria de tu empresa.</CardDescription>
              </div>
               <AddMaquinariaDialog onMaquinariaAdded={onMaquinariaAdded}>
                 <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Truck className="mr-2 h-4 w-4"/> Añadir Maquinaria</Button>
              </AddMaquinariaDialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {maquinaria.length > 0 ? maquinaria.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                     <Truck className="h-5 w-5 text-muted-foreground" />
                     <div>
                      <p className="font-semibold">{m.nombre}</p>
                      <p className="text-sm text-muted-foreground">Ref: {m.matriculaORef}</p>
                    </div>
                  </div>
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-500/10"><Trash2 className="h-5 w-5"/></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                           Esta acción no se puede deshacer. Esto eliminará permanentemente la maquinaria de tu empresa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveMaquinaria(m.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              )) : (
                 <p className="text-center py-6 text-muted-foreground">No hay maquinaria registrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
