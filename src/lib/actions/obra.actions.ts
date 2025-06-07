// src/lib/actions/obra.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObraSchema, type Obra } from '@/lib/types';
import { mockObras } from '@/lib/mockData/obras'; // Asegúrate de tener este archivo

let Cobras: Obra[] = [...mockObras];

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
  };

  Cobras.push(newObra);
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/new`);

  // Simulate API delay for creation
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return { success: true, message: 'Nueva obra creada correctamente.', obra: newObra };
}

export async function updateObra(obraId: string, empresaId: string, data: Partial<Omit<Obra, 'id' | 'empresaId'>>): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const obraIndex = Cobras.findIndex(o => o.id === obraId && o.empresaId === empresaId);
  if (obraIndex === -1) {
    return { success: false, message: 'Obra no encontrada.' };
  }

  const partialSchema = CreateObraSchema.partial(); // Use partial for updates
  const validationResult = partialSchema.safeParse(data);

  if (!validationResult.success) {
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  Cobras[obraIndex] = { ...Cobras[obraIndex], ...validationResult.data };
  
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/${obraId}`); // If you have a detail page
  
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
