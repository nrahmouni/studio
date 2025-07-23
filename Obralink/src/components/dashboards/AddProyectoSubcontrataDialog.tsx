
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import type { Proyecto, Constructora } from '@/lib/types';
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
  constructoras: Constructora[];
  children: React.ReactNode;
}

const AddProyectoFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  clienteNombre: z.string().min(1, "El nombre del cliente final es requerido"),
  constructoraId: z.string({ required_error: "Debes asignar una constructora cliente." }),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida." }).nullable(),
  fechaFin: z.date().optional().nullable(),
});

type AddProyectoFormData = z.infer<typeof AddProyectoFormSchema>;

export function AddProyectoSubcontrataDialog({ onProyectoAdded, constructoras, children }: AddProyectoDialogProps) {
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
    const subcontrataId = localStorage.getItem('subcontrataId_obra_link');
    if (!subcontrataId) {
        toast({ title: 'Error', description: 'No se pudo identificar tu empresa subcontrata.', variant: 'destructive' });
        return;
    }

    const result = await addProyecto({ 
      subcontrataId, 
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
          
            Introduce los detalles del nuevo proyecto que gestionará tu empresa.
          
        
        
            
              Nombre del Proyecto
              
              {form.formState.errors.nombre && El nombre es requeridoEj: Reforma Local Comercial}
            

            
              Dirección
              
              {form.formState.errors.direccion && La dirección es requeridaEj: Calle Gran Vía, 28, Madrid}
            
            
                Cliente (Constructora)
                
                    
                        
                            Selecciona una constructora
                        
                        
                            {constructoras.map(s => (
                                {s.nombre}
                            ))}
                        
                    
                
                {form.formState.errors.constructoraId && Debes asignar una constructora cliente.}
            

            
              Nombre del Cliente Final
              
              {form.formState.errors.clienteNombre && El nombre del cliente final es requeridoEj: Zara Home S.A.}
            

            
                
                    
                        Fecha de Inicio
                        
                            
                                  
                                    
                                      
                                        
                                          {field.value ? format(field.value, "PPP", {locale: es}) : Selecciona}
                                        
                                      
                                    
                                  
                                  
                                    
                                    
                                    
                                    
                                  
                                
                            
                        
                        {form.formState.errors.fechaInicio && La fecha de inicio es requerida.}
                    
                    
                        Fecha de Fin (Opc.)
                        
                            
                                  
                                    
                                      
                                        
                                          {field.value ? format(field.value, "PPP", {locale: es}) : Selecciona}
                                        
                                      
                                    
                                  
                                  
                                    
                                    
                                    
                                    
                                  
                                
                            
                        
                    
                
            

          
            
              {form.formState.isSubmitting ?   Crear Proyecto
            
          
        
      
    
  );
}
