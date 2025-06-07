// src/app/(app)/partes/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Assuming you might need it
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2, FileText, UploadCloud, Send } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// import { createParte } from '@/lib/actions/parte.actions'; // Acción a implementar
// import { getObrasActivasPorEmpresa, getUsuariosPorEmpresa } from '@/lib/actions'; // Acciones para popular selects
import { useState, useEffect } from 'react';

// Esquema de validación (simplificado)
const ParteFormSchema = z.object({
  obraId: z.string().min(1, 'Debes seleccionar una obra.'),
  fecha: z.date({ required_error: "La fecha es requerida." }),
  tareasRealizadas: z.string().min(10, 'Describe las tareas realizadas (mínimo 10 caracteres).'),
  incidencias: z.string().optional(),
  // fotosURLs: z.array(z.string().url()).optional(), // Para futura carga de imágenes
});

type ParteFormData = z.infer<typeof ParteFormSchema>;

// Datos simulados para los selects
const mockObras = [
  { id: 'obra-1-1', nombre: 'Reforma Integral Piso Centro' },
  { id: 'obra-1-2', nombre: 'Construcción Nave Industrial Polígono Sur' },
  { id: 'obra-2-1', nombre: 'Fachada Edificio Sol' },
];

export default function NuevoPartePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const form = useForm<ParteFormData>({
    resolver: zodResolver(ParteFormSchema),
    defaultValues: {
      obraId: '',
      fecha: new Date(),
      tareasRealizadas: '',
      incidencias: '',
    },
  });

  useEffect(() => {
    const storedUsuarioId = localStorage.getItem('usuarioId_obra_link');
    const storedEmpresaId = localStorage.getItem('empresaId_obra_link');
    const userRole = localStorage.getItem('userRole_obra_link');

    if (storedUsuarioId && storedEmpresaId) {
      setUsuarioId(storedUsuarioId);
      setEmpresaId(storedEmpresaId);
    } else if (userRole === 'empresa' && storedEmpresaId) {
      // Admin/Jefe de obra creando parte, no tienen usuarioId directo en este contexto,
      // pero se necesita para la creación del parte (podría ser un select o autoasignado)
      setUsuarioId('admin_or_jefe_obra_placeholder'); // Placeholder, necesitaría lógica real
      setEmpresaId(storedEmpresaId);
      toast({title: "Nota", description: "Como administrador, selecciona el trabajador si es necesario (funcionalidad futura)."});
    }
    else {
      toast({
        title: "Error de autenticación",
        description: "No se pudo identificar al usuario o la empresa. Serás redirigido.",
        variant: "destructive",
      });
      router.push('/auth/select-role');
    }
  }, [router, toast]);

  const onSubmit = async (data: ParteFormData) => {
    if (!usuarioId || !empresaId) {
      toast({ title: 'Error', description: 'Falta información de usuario o empresa.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    // Simulación de creación de parte
    console.log("Datos del nuevo parte:", { ...data, usuarioId, empresaId });
    // const result = await createParte({ ...data, usuarioId, empresaId });
    // if (result.success) {
    //   toast({ title: 'Éxito', description: 'Nuevo parte de trabajo registrado.' });
    //   router.push('/partes');
    // } else {
    //   toast({ title: 'Error', description: result.message || 'No se pudo registrar el parte.', variant: 'destructive' });
    // }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular llamada a API
     toast({
      title: 'Simulación Exitosa',
      description: `Parte de trabajo para la obra "${mockObras.find(o => o.id === data.obraId)?.nombre}" sería creado.`,
    });
    router.push('/partes');
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="bg-primary/5 p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold font-headline text-primary">Registrar Nuevo Parte de Trabajo</CardTitle>
              <CardDescription className="text-md text-muted-foreground">Documenta las actividades del día.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="obraId" className="font-semibold">Obra</Label>
              <Controller
                name="obraId"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Selecciona una obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockObras.map(obra => ( // Usar mockObras o las cargadas dinámicamente
                        <SelectItem key={obra.id} value={obra.id}>{obra.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.obraId && <p className="text-sm text-destructive mt-1">{form.formState.errors.obraId.message}</p>}
            </div>

            <div>
              <Label htmlFor="fecha" className="font-semibold block mb-1">Fecha del Parte</Label>
               <Controller
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Selecciona una fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.fecha && <p className="text-sm text-destructive mt-1">{form.formState.errors.fecha.message}</p>}
            </div>

            <div>
              <Label htmlFor="tareasRealizadas" className="font-semibold">Tareas Realizadas</Label>
              <Textarea
                id="tareasRealizadas"
                {...form.register('tareasRealizadas')}
                rows={5}
                className="mt-1"
                placeholder="Describe detalladamente los trabajos efectuados, materiales usados, etc."
              />
              {form.formState.errors.tareasRealizadas && <p className="text-sm text-destructive mt-1">{form.formState.errors.tareasRealizadas.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="incidencias" className="font-semibold">Incidencias (opcional)</Label>
              <Textarea
                id="incidencias"
                {...form.register('incidencias')}
                rows={3}
                className="mt-1"
                placeholder="Anota cualquier problema, retraso, o evento relevante."
              />
            </div>

            {/* Futura sección para adjuntar fotos 
            <div>
              <Label className="font-semibold">Adjuntar Fotos (opcional)</Label>
              <Button type="button" variant="outline" className="w-full mt-1 flex items-center justify-center">
                <UploadCloud className="mr-2 h-5 w-5" />
                Seleccionar Imágenes
              </Button>
              <p className="text-xs text-muted-foreground mt-1">Puedes adjuntar varias imágenes del progreso o incidencias.</p>
            </div>
            */}


            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> Registrar Parte</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
