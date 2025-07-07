'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building, Trash2, UserPlus, HardHat, User, CheckCircle } from 'lucide-react';
import { getConstructoras, getProyectosByConstructora, getTrabajadoresByProyecto, removeTrabajadorFromProyecto } from '@/lib/actions/app.actions';
import type { Constructora, Proyecto, Trabajador } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AddTrabajadorDialog } from '@/components/dashboards/AddTrabajadorDialog';

export default function GestionProyectosPage() {
  const [constructoras, setConstructoras] = useState<Constructora[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  
  const [selectedConstructora, setSelectedConstructora] = useState<Constructora | null>(null);
  const [selectedProyecto, setSelectedProyecto] = useState<Proyecto | null>(null);

  const [loadingConstructoras, setLoadingConstructoras] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [loadingTrabajadores, setLoadingTrabajadores] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConstructoras = async () => {
      setLoadingConstructoras(true);
      const data = await getConstructoras();
      setConstructoras(data);
      setLoadingConstructoras(false);
    };
    fetchConstructoras();
  }, []);

  const handleSelectConstructora = async (constructora: Constructora) => {
    setSelectedConstructora(constructora);
    setSelectedProyecto(null);
    setTrabajadores([]);
    setProyectos([]);
    setLoadingProyectos(true);
    const proyData = await getProyectosByConstructora(constructora.id);
    setProyectos(proyData);
    setLoadingProyectos(false);
  };

  const handleSelectProyecto = async (proyecto: Proyecto) => {
    setSelectedProyecto(proyecto);
    setTrabajadores([]);
    setLoadingTrabajadores(true);
    const trabData = await getTrabajadoresByProyecto(proyecto.id);
    setTrabajadores(trabData);
    setLoadingTrabajadores(false);
  };

  const handleRemoveTrabajador = async (trabajadorId: string) => {
    if (!selectedProyecto) return;
    const result = await removeTrabajadorFromProyecto(selectedProyecto.id, trabajadorId);
    if (result.success) {
      toast({ title: "Éxito", description: `Trabajador eliminado del proyecto.` });
      setTrabajadores(prev => prev.filter(t => t.id !== trabajadorId));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };
  
  const onTrabajadorAdded = useCallback((newTrabajador: Trabajador) => {
      setTrabajadores(prev => [...prev, newTrabajador]);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Gestión de Proyectos y Personal</h1>
        <p className="text-muted-foreground mt-1">Asigna trabajadores a los proyectos de tus clientes.</p>
      </div>

      {/* Step 1: Select Constructora */}
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</div>
            <span>Selecciona un Cliente (Constructora)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingConstructoras ? (
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {constructoras.map(c => (
                <Button
                  key={c.id}
                  variant={selectedConstructora?.id === c.id ? 'default' : 'outline'}
                  className="h-20 text-lg justify-start p-4"
                  onClick={() => handleSelectConstructora(c)}
                >
                  <Building className="mr-4 h-6 w-6"/> {c.nombre}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Select Proyecto */}
      {selectedConstructora && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">2</div>
              <span>Selecciona el Proyecto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProyectos ? (
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proyectos.length > 0 ? (
                  proyectos.map(p => (
                    <Button
                      key={p.id}
                      variant={selectedProyecto?.id === p.id ? 'default' : 'outline'}
                      className="h-20 text-lg justify-start p-4"
                      onClick={() => handleSelectProyecto(p)}
                    >
                      <HardHat className="mr-4 h-6 w-6"/> {p.nombre}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay proyectos para este cliente.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Manage Trabajadores */}
      {selectedProyecto && (
         <Card className="animate-fade-in-up">
           <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground font-bold text-lg">3</div>
              <span>Gestiona los Trabajadores Asignados</span>
            </CardTitle>
            <CardDescription>Añade o elimina personal para el proyecto: {selectedProyecto.nombre}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrabajadores ? (
              <div className="text-center p-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>
            ) : (
              <div className="space-y-3">
                {trabajadores.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <span className="flex items-center gap-3 text-lg"><User className="h-5 w-5 text-muted-foreground"/> {t.nombre}</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleRemoveTrabajador(t.id)}>
                          <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700"/>
                          <span className="sr-only">Eliminar</span>
                      </Button>
                  </div>
                ))}
                
                {trabajadores.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No hay trabajadores asignados a este proyecto todavía.</p>
                )}

                <AddTrabajadorDialog proyecto={selectedProyecto} onTrabajadorAdded={onTrabajadorAdded}>
                    <Button variant="default" className="w-full mt-6 text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90">
                        <UserPlus className="mr-2 h-5 w-5"/> Añadir Nuevo Trabajador
                    </Button>
                </AddTrabajadorDialog>
              </div>
            )}
          </CardContent>
         </Card>
      )}
    </div>
  );
}