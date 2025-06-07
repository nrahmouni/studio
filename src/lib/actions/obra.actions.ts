
// src/lib/actions/obra.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObraSchema, type Obra, type UsuarioFirebase } from '@/lib/types';
import { mockObras } from '@/lib/mockData/obras'; 
import { mockUsuarios } from '@/lib/mockData/usuarios'; // Import mockUsuarios

let Cobras: Obra[] = [...mockObras];
let CUsuarios: UsuarioFirebase[] = [...mockUsuarios]; // Use CUsuarios for direct modification

// Schema for data coming from the "Nueva Obra" form, including jefeObraEmail
const CreateObraFormInputSchema = ObraSchema.omit({ 
  id: true, 
  empresaId: true, // empresaId will be added based on logged-in user
  jefeObraId: true, // jefeObraId will be derived from jefeObraEmail
  dataAIHint: true 
}).extend({
  jefeObraEmail: z.string().email("Email del jefe de obra inválido").optional().or(z.literal('')),
});
type CreateObraFormInputData = z.infer<typeof CreateObraFormInputSchema>;


export async function getObrasByEmpresaId(empresaId: string): Promise<Obra[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return Cobras.filter(obra => obra.empresaId === empresaId);
}

export async function getObraById(obraId: string, empresaId: string): Promise<Obra | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const obra = Cobras.find(o => o.id === obraId && o.empresaId === empresaId);
  return obra || null;
}

export async function createObra(data: CreateObraFormInputData, empresaId: string): Promise<{ success: boolean; message: string; obra?: Obra }> {
  // Validate the form input first (which includes jefeObraEmail)
  const formValidationResult = CreateObraFormInputSchema.safeParse(data);
  if (!formValidationResult.success) {
    console.error("Form validation errors:", formValidationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación del formulario: ${JSON.stringify(formValidationResult.error.flatten().fieldErrors)}` };
  }

  const { jefeObraEmail, ...obraData } = formValidationResult.data;
  let jefeObraIdToAssign: string | undefined = undefined;

  if (jefeObraEmail) {
    const foundJefeObra = CUsuarios.find( // Use CUsuarios
      (user: UsuarioFirebase) => 
        user.email === jefeObraEmail && 
        user.rol === 'jefeObra' && 
        user.empresaId === empresaId
    );
    if (foundJefeObra) {
      jefeObraIdToAssign = foundJefeObra.id;
    } else {
      console.warn(`Jefe de Obra con email ${jefeObraEmail} no encontrado o no tiene el rol correcto.`);
    }
  }
  
  const finalObraData = {
    ...obraData,
    empresaId, 
    jefeObraId: jefeObraIdToAssign,
    costosPorCategoria: obraData.costosPorCategoria || [],
  };

  const obraSchemaForCreate = ObraSchema.omit({id: true, dataAIHint: true });
  const finalValidationResult = obraSchemaForCreate.safeParse(finalObraData);

  if (!finalValidationResult.success) {
    console.error("Final Obra data validation errors:", finalValidationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación de datos de obra: ${JSON.stringify(finalValidationResult.error.flatten().fieldErrors)}` };
  }

  const newObra: Obra = {
    ...finalValidationResult.data,
    id: `obra-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  Cobras.push(newObra);
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/new`);

  await new Promise(resolve => setTimeout(resolve, 700));
  
  return { success: true, message: 'Nueva obra creada correctamente.', obra: newObra };
}

// Update data type to include trabajadoresAsignados
export async function updateObra(
  obraId: string, 
  empresaId: string, 
  data: Partial<Omit<Obra, 'id' | 'empresaId'> & { trabajadoresAsignados?: string[] }>
): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const obraIndex = Cobras.findIndex(o => o.id === obraId && o.empresaId === empresaId);
  if (obraIndex === -1) {
    return { success: false, message: 'Obra no encontrada.' };
  }

  const { trabajadoresAsignados, ...obraCoreData } = data;

  const partialSchema = ObraSchema.partial().omit({ id: true, empresaId: true });
  const validationResult = partialSchema.safeParse(obraCoreData);

  if (!validationResult.success) {
    console.error("Update validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación al actualizar: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }
  
  const validatedDataWithCosts = {
      ...validationResult.data,
      costosPorCategoria: validationResult.data.costosPorCategoria || Cobras[obraIndex].costosPorCategoria || [],
  };

  Cobras[obraIndex] = { ...Cobras[obraIndex], ...validatedDataWithCosts };

  // Handle worker assignments
  let workersUpdated = false;
  if (trabajadoresAsignados !== undefined) { // Check if the array was provided (even if empty)
    CUsuarios.forEach((user, index) => {
      if (user.empresaId === empresaId && user.rol === 'trabajador') {
        const isCurrentlyAssigned = user.obrasAsignadas?.includes(obraId);
        const shouldBeAssigned = trabajadoresAsignados.includes(user.id);

        if (shouldBeAssigned && !isCurrentlyAssigned) {
          CUsuarios[index].obrasAsignadas = [...(CUsuarios[index].obrasAsignadas || []), obraId];
          workersUpdated = true;
        } else if (!shouldBeAssigned && isCurrentlyAssigned) {
          CUsuarios[index].obrasAsignadas = (CUsuarios[index].obrasAsignadas || []).filter(id => id !== obraId);
          workersUpdated = true;
        }
      }
    });
  }
  
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/${obraId}`); 
  revalidatePath(`/(app)/obras/${obraId}/edit`);
  if (workersUpdated) {
    revalidatePath('/(app)/usuarios'); // If worker assignments changed
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Obra actualizada con éxito.', obra: Cobras[obraIndex] };
}

export async function deleteObra(obraId: string, empresaId: string): Promise<{ success: boolean; message: string }> {
  const initialLength = Cobras.length;
  Cobras = Cobras.filter(o => !(o.id === obraId && o.empresaId === empresaId));
  
  if (Cobras.length === initialLength) {
    return { success: false, message: 'Obra no encontrada para eliminar.' };
  }
  
  // Also remove this obraId from any worker's obrasAsignadas list
  CUsuarios.forEach((user, index) => {
    if (user.empresaId === empresaId && user.obrasAsignadas?.includes(obraId)) {
      CUsuarios[index].obrasAsignadas = (CUsuarios[index].obrasAsignadas || []).filter(id => id !== obraId);
    }
  });

  revalidatePath('/(app)/obras');
  revalidatePath('/(app)/usuarios'); 
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Obra eliminada con éxito.' };
}
