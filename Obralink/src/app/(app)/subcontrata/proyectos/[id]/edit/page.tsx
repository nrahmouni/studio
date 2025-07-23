
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import { getProyectoById, getConstructoras, updateProyecto } from '@/lib/actions/app.actions';
import type { Proyecto, Constructora } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const EditProyectoFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  clienteNombre: z.string().min(1, "El nombre del cliente final es requerido").optional(),
  constructoraId: z.string({ required_error: "Debes asignar una constructora cliente." }),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida." }).nullable(),
  fechaFin: z.date().optional().nullable(),
});
type EditProyectoFormData = z.infer<typeof EditProyectoFormSchema>;

export default function EditSubcontrataProyectoPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { toast } } from '@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import type { Proyecto, Subcontrata } from '@/lib/types';
import { addProyecto } from '@/lib/actions/app.actions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AddProyectoDialogProps {
  onProyectoAdded: (newProyecto: Proyecto) => void;
  subcontratas: Subcontrata[];
  children: React.ReactNode;
}

const AddProyectoFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  clienteNombre: z.string().min(1, "El nombre del cliente final es requerido"),
  subcontrataId: z.string({ required_error: "Debes asignar una subcontrata." }),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida." }).nullable(),
  fechaFin: z.date().optional().nullable(),
});

type AddProyectoFormData = z.infer<typeof AddProyectoFormSchema>;

export function AddProyectoDialog({ onProyectoAdded, subcontratas, children }: AddProyectoDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(AddProyectoFormSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      clienteNombre: '',
    },
  });

  const handleSubmit = async (data: AddProyectoFormData) => {
    const constructoraId = localStorage.getItem('constructoraId_obra_link');
    if (!constructoraId) {
        toast({ title: 'Error', description: 'No se pudo identificar la constructora.', variant: 'destructive' });
        return;
    }

    const result = await addProyecto({ 
        constructoraId, 
        ...data,
        fechaInicio: data.fechaInicio ? data.fechaInicio.toISOString() : null,
        fechaFin: data.fechaFin ? data.fechaFin.toISOString() : null,
    });
    if (result.success && result.proyecto) {
      toast({ title: 'Éxito', description: `Proyecto ${result.proyecto.nombre} añadido.` });
      onProyectoAdded(result.proyecto);
      form.reset();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
    }
  };

  return (
    
        
          {children}
        
        
          
            Añadir Nuevo Proyecto
          
            Introduce los detalles del nuevo proyecto y asígnalo a una subcontrata.
          
        
        
            
              Nombre del Proyecto
              
              {form.formState.errors.nombre && El nombre es requeridoEj: Reforma Integral C/ Mayor}
            

            
              Dirección
              
              {form.formState.errors.direccion && La dirección es requeridaEj: Calle Mayor, 1, Madrid}
            
            
              Nombre del Cliente Final
              
              {form.formState.errors.clienteNombre && El nombre del cliente final es requeridoEj: Inversiones Capital S.A.}
            
            
                Asignar a Subcontrata
                
                    
                        
                            Selecciona una subcontrata
                        
                        
                            {subcontratas.map(s => (
                                {s.nombre}
                            ))}
                        
                    
                
                {form.formState.errors.subcontrataId && Debes asignar una subcontrata.}
            

            
                
                    
                        Fecha de Inicio
                        
                            
                                  
                                    
                                      
                                        
                                          {field.value ? format(field.value, "PPP", {locale: es}) : Selecciona fecha}
                                        
                                      
                                    
                                  
                                  
                                    
                                    
                                    
                                    
                                  
                                
                            
                        
                        {form.formState.errors.fechaInicio && La fecha de inicio es requerida.}
                    
                    
                        Fecha de Fin (Opcional)
                        
                            
                                  
                                    
                                      
                                        
                                          {field.value ? format(field.value, "PPP", {locale: es}) : Selecciona fecha}
                                        
                                      
                                    
                                  
                                  
                                    
                                    
                                    
                                    
                                  
                                
                            
                        
                    
                
            

          
            
              {form.formState.isSubmitting ?   Añadir Proyecto
            
          
        
      
    
  );
}
