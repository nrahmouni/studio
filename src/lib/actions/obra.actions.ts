
// src/lib/actions/obra.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObraSchema, type Obra } from '@/lib/types';
import { mockObras } from '@/lib/mockData/obras'; 

let Cobras: Obra[] = [...mockObras];

// CreateObraSchema now implicitly includes costosPorCategoria as optional from ObraSchema
const CreateObraSchema = ObraSchema.omit({ id: true });
type CreateObraData = z.infer<typeof CreateObraSchema>;


export async function getObrasByEmpresaId(empresaId: string): Promise<Obra[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return Cobras.filter(obra => obra.empresaId === empresaId);
}

export async function getObraById(obraId: string, empresaId: string): Promise<Obra | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const obra = Cobras.find(o => o.id === obraId && o.empresaId === empresaId);
  return obra || null;
}

export async function createObra(data: CreateObraData): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const validationResult = CreateObraSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const newObra: Obra = {
    ...validationResult.data,
    id: `obra-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    // costosPorCategoria will be taken from validationResult.data, default to [] if not provided
    costosPorCategoria: validationResult.data.costosPorCategoria || [],
  };

  Cobras.push(newObra);
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/new`);

  await new Promise(resolve => setTimeout(resolve, 700));
  
  return { success: true, message: 'Nueva obra creada correctamente.', obra: newObra };
}

export async function updateObra(obraId: string, empresaId: string, data: Partial<Omit<Obra, 'id' | 'empresaId'>>): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const obraIndex = Cobras.findIndex(o => o.id === obraId && o.empresaId === empresaId);
  if (obraIndex === -1) {
    return { success: false, message: 'Obra no encontrada.' };
  }

  // Use ObraSchema.partial() to allow partial updates including costosPorCategoria
  const partialSchema = ObraSchema.partial().omit({ id: true, empresaId: true });
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    console.error("Update validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación al actualizar: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }
  
  // Ensure costosPorCategoria is an array, even if undefined in data
  const validatedDataWithCosts = {
      ...validationResult.data,
      costosPorCategoria: validationResult.data.costosPorCategoria || Cobras[obraIndex].costosPorCategoria || [],
  };


  Cobras[obraIndex] = { ...Cobras[obraIndex], ...validatedDataWithCosts };
  
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/${obraId}`); 
  revalidatePath(`/(app)/obras/${obraId}/edit`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Obra actualizada con éxito.', obra: Cobras[obraIndex] };
}

export async function deleteObra(obraId: string, empresaId: string): Promise<{ success: boolean; message: string }> {
  const initialLength = Cobras.length;
  Cobras = Cobras.filter(o => !(o.id === obraId && o.empresaId === empresaId));
  
  if (Cobras.length === initialLength) {
    return { success: false, message: 'Obra no encontrada para eliminar.' };
  }

  revalidatePath('/(app)/obras');
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Obra eliminada con éxito.' };
}
