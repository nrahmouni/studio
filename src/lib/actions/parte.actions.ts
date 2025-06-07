// src/lib/actions/parte.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ParteSchema, type Parte } from '@/lib/types';
import { mockPartes } from '@/lib/mockData/partes';
import { mockUsuarios } from '@/lib/mockData/usuarios';
import { mockObras } from '@/lib/mockData/obras';


let Cpartes: Parte[] = [...mockPartes];

const CreateParteSchema = ParteSchema.omit({ 
  id: true, 
  validado: true, 
  validadoPor: true, 
  timestamp: true,
  dataAIHint: true,
});
type CreateParteData = z.infer<typeof CreateParteSchema>;


export async function getPartesByEmpresaYObra(empresaId: string, obraId?: string): Promise<Parte[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  // 1. Get obras for the empresa
  const obrasEmpresa = mockObras.filter(o => o.empresaId === empresaId);
  const obraIdsEmpresa = obrasEmpresa.map(o => o.id);

  // 2. Filter partes:
  //    - Must belong to an obra of the empresa.
  //    - If obraId is provided, must match that obraId.
  return Cpartes.filter(parte => {
    const perteneceAEmpresa = obraIdsEmpresa.includes(parte.obraId);
    if (obraId) {
      return perteneceAEmpresa && parte.obraId === obraId;
    }
    return perteneceAEmpresa;
  });
}

export async function getParteById(parteId: string, empresaId: string): Promise<Parte | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const parte = Cpartes.find(p => p.id === parteId);
  
  // Verify the parte belongs to the empresa indirectly via obra
  if (parte) {
    const obra = mockObras.find(o => o.id === parte.obraId);
    if (obra && obra.empresaId === empresaId) {
      return parte;
    }
  }
  return null;
}


export async function createParte(data: CreateParteData): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const validationResult = CreateParteSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const newParte: Parte = {
    ...validationResult.data,
    id: `parte-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    validado: false,
    timestamp: new Date(),
  };

  Cpartes.unshift(newParte); // Add to the beginning of the array
  revalidatePath('/(app)/partes');
  revalidatePath(`/(app)/partes/new`);
  
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
  
  return { success: true, message: 'Nuevo parte de trabajo registrado.', parte: newParte };
}

// Placeholder for update and delete if needed later
export async function updateParte(parteId: string, data: Partial<Omit<Parte, 'id' | 'empresaId' | 'usuarioId' >>): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const parteIndex = Cpartes.findIndex(p => p.id === parteId);
  if (parteIndex === -1) {
    return { success: false, message: 'Parte no encontrado.' };
  }

  const partialSchema = CreateParteSchema.partial();
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  Cpartes[parteIndex] = { ...Cpartes[parteIndex], ...validationResult.data };
  
  revalidatePath('/(app)/partes');
  revalidatePath(`/(app)/partes/${parteId}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Parte actualizado con éxito.', parte: Cpartes[parteIndex] };
}

export async function validateParte(parteId: string, validadorId: string): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const parteIndex = Cpartes.findIndex(p => p.id === parteId);
  if (parteIndex === -1) {
    return { success: false, message: 'Parte no encontrado.' };
  }
  
  const validador = mockUsuarios.find(u => u.id === validadorId && (u.rol === 'admin' || u.rol === 'jefeObra'));
  if (!validador) {
    return { success: false, message: 'Usuario validador no autorizado.' };
  }
  
  // Check if validador belongs to the same company as the obra of the parte
  const obraDelParte = mockObras.find(o => o.id === Cpartes[parteIndex].obraId);
  if (!obraDelParte || obraDelParte.empresaId !== validador.empresaId) {
      return { success: false, message: 'El validador no pertenece a la empresa de la obra.' };
  }

  Cpartes[parteIndex].validado = true;
  Cpartes[parteIndex].validadoPor = validadorId;
  
  revalidatePath('/(app)/partes');
  revalidatePath(`/(app)/partes/${parteId}`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Parte validado con éxito.', parte: Cpartes[parteIndex] };
}

