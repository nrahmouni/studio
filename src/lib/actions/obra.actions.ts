
// src/lib/actions/obra.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObraSchema, type Obra, type UsuarioFirebase } from '@/lib/types';
import { mockObras } from '@/lib/mockData/obras'; 
import { mockUsuarios } from '@/lib/mockData/usuarios'; 

let Cobras: Obra[] = [...mockObras];
let CUsuarios: UsuarioFirebase[] = [...mockUsuarios]; 

const CreateObraFormInputSchema = ObraSchema.omit({ 
  id: true, 
  empresaId: true, 
  jefeObraId: true, 
  dataAIHint: true 
}).extend({
  jefeObraEmail: z.string().email("Email del jefe de obra inválido").optional().or(z.literal('')),
});
type CreateObraFormInputData = z.infer<typeof CreateObraFormInputSchema>;


export async function getObrasByEmpresaId(empresaId: string): Promise<Obra[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); 
  return Cobras.filter(obra => obra.empresaId === empresaId);
}

export async function getObraById(obraId: string, empresaId: string): Promise<Obra | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const obra = Cobras.find(o => o.id === obraId && o.empresaId === empresaId);
  return obra || null;
}

export async function createObra(data: CreateObraFormInputData, empresaId: string): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const formValidationResult = CreateObraFormInputSchema.safeParse(data);
  if (!formValidationResult.success) {
    console.error("Form validation errors:", formValidationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación del formulario: ${JSON.stringify(formValidationResult.error.flatten().fieldErrors)}` };
  }

  const { jefeObraEmail, ...obraData } = formValidationResult.data;
  let jefeObraIdToAssign: string | undefined = undefined;

  if (jefeObraEmail) {
    const foundJefeObra = CUsuarios.find( 
      (user: UsuarioFirebase) => 
        user.email === jefeObraEmail && 
        user.rol === 'jefeObra' && 
        user.empresaId === empresaId
    );
    if (foundJefeObra) {
      jefeObraIdToAssign = foundJefeObra.id;
    } else {
      console.warn(`Jefe de Obra con email ${jefeObraEmail} no encontrado en la empresa ${empresaId} o no tiene el rol correcto.`);
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
    // dataAIHint can be auto-generated or set to a default if needed
  };

  Cobras.push(newObra);
  revalidatePath('/(app)/obras');
  revalidatePath(`/(app)/obras/new`);
  if (jefeObraIdToAssign) {
    // If a jefe de obra was assigned, revalidate their user page if it exists, or user list
    revalidatePath(`/(app)/usuarios/${jefeObraIdToAssign}/edit`);
    revalidatePath('/(app)/usuarios');
  }

  await new Promise(resolve => setTimeout(resolve, 700));
  
  return { success: true, message: `La obra "${newObra.nombre}" ha sido creada correctamente.`, obra: newObra };
}

export async function updateObra(
  obraId: string, 
  empresaId: string, 
  data: Partial<Omit<Obra, 'id' | 'empresaId'> & { trabajadoresAsignados?: string[] }>
): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const obraIndex = Cobras.findIndex(o => o.id === obraId && o.empresaId === empresaId);
  if (obraIndex === -1) {
    return { success: false, message: 'Obra no encontrada o no pertenece a tu empresa.' };
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

  let workersUpdated = false;
  if (trabajadoresAsignados !== undefined) { 
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
    revalidatePath('/(app)/usuarios'); 
    // Also revalidate individual worker edit pages if they exist
    trabajadoresAsignados?.forEach(workerId => revalidatePath(`/(app)/usuarios/${workerId}/edit`));
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: `La obra "${Cobras[obraIndex].nombre}" ha sido actualizada.`, obra: Cobras[obraIndex] };
}

export async function deleteObra(obraId: string, empresaId: string): Promise<{ success: boolean; message: string }> {
  const obraIndex = Cobras.findIndex(o => o.id === obraId && o.empresaId === empresaId);
  if (obraIndex === -1) {
    return { success: false, message: 'Obra no encontrada para eliminar.' };
  }
  const obraNombre = Cobras[obraIndex].nombre;
  Cobras.splice(obraIndex, 1);
  
  CUsuarios.forEach((user, index) => {
    if (user.empresaId === empresaId && user.obrasAsignadas?.includes(obraId)) {
      CUsuarios[index].obrasAsignadas = (CUsuarios[index].obrasAsignadas || []).filter(id => id !== obraId);
    }
  });

  revalidatePath('/(app)/obras');
  revalidatePath('/(app)/usuarios'); 
  // Revalidate any other paths that might display this obra or its workers
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: `Obra "${obraNombre}" eliminada con éxito.` };
}
