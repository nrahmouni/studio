'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EmpresaSchema, type Empresa } from '@/lib/types';
import { mockEmpresas } from '@/lib/mockData/empresas';

let Cempresas: Empresa[] = [...mockEmpresas];

export async function getEmpresas(): Promise<Empresa[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return Cempresas;
}

export async function getEmpresaProfile(id: string): Promise<Empresa | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const empresa = Cempresas.find(e => e.id === id);
  return empresa || null;
}

export async function getDefaultEmpresaProfile(): Promise<Empresa | null> {
  // Simulate API delay for loading the default/first company profile
  await new Promise(resolve => setTimeout(resolve, 500));
  return Cempresas.length > 0 ? Cempresas[0] : null;
}


export async function updateEmpresaProfile(id: string, data: Partial<Empresa>): Promise<{ success: boolean; message: string; empresa?: Empresa }> {
  try {
    const empresaIndex = Cempresas.findIndex(e => e.id === id);
    if (empresaIndex === -1) {
      return { success: false, message: 'Empresa no encontrada.' };
    }

    // Validate only the fields present in data
    const partialSchema = EmpresaSchema.partial();
    const validationResult = partialSchema.safeParse(data);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      return { success: false, message: `Error de validación: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` };
    }
    
    Cempresas[empresaIndex] = { ...Cempresas[empresaIndex], ...validationResult.data };
    
    revalidatePath('/(app)/company-profile');
    revalidatePath(`/empresas/${id}`); // If you have a specific page for each company
    
    return { success: true, message: 'Perfil de empresa actualizado con éxito.', empresa: Cempresas[empresaIndex] };

  } catch (error) {
    console.error("Error updating empresa profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió.";
    return { success: false, message: `Error al actualizar el perfil: ${errorMessage}` };
  }
}


const CreateEmpresaSchema = EmpresaSchema.omit({ id: true });

export async function createEmpresa(data: Omit<Empresa, 'id'>): Promise<{ success: boolean; message: string; empresa?: Empresa }> {
  try {
    const validationResult = CreateEmpresaSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, message: `Error de validación: ${validationResult.error.flatten().fieldErrors}` };
    }

    const newEmpresa: Empresa = {
      ...validationResult.data,
      id: `empresa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    Cempresas.push(newEmpresa);
    revalidatePath('/(app)/company-profile'); // Or a page listing companies
    return { success: true, message: 'Empresa creada con éxito.', empresa: newEmpresa };

  } catch (error) {
    console.error("Error creating empresa:", error);
    return { success: false, message: 'Error al crear la empresa.' };
  }
}
