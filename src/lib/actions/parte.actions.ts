
// src/lib/actions/parte.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ParteSchema, type Parte } from '@/lib/types';
import { mockPartes } from '@/lib/mockData/partes';
import { mockUsuarios } from '@/lib/mockData/usuarios';
import { mockObras } from '@/lib/mockData/obras';


let Cpartes: Parte[] = [...mockPartes];

// Schema para la entrada de createParte, permitiendo validación directa
const CreateParteInputSchema = ParteSchema.pick({
  usuarioId: true,
  obraId: true,
  fecha: true,
  tareasRealizadas: true,
  horasTrabajadas: true,
  incidencias: true,
  tareasSeleccionadas: true,
  fotosURLs: true,
  firmaURL: true,
  validado: true, 
  validadoPor: true,
});
type CreateParteData = z.infer<typeof CreateParteInputSchema>;

// Schema para la entrada de updateParte
const UpdateParteDataSchema = ParteSchema.partial().pick({
  obraId: true, // Aunque raro, podría cambiarse si el parte se asignó mal inicialmente
  fecha: true,
  tareasRealizadas: true,
  horasTrabajadas: true,
  incidencias: true,
  tareasSeleccionadas: true,
  fotosURLs: true,
  firmaURL: true,
  validado: true,
  validadoPor: true,
  dataAIHint: true,
});
type UpdateParteData = z.infer<typeof UpdateParteDataSchema>;


export async function getPartesByEmpresaYObra(empresaId: string, obraId?: string): Promise<Parte[]> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const obrasEmpresa = mockObras.filter(o => o.empresaId === empresaId);
  const obraIdsEmpresa = obrasEmpresa.map(o => o.id);

  return Cpartes.filter(parte => {
    const perteneceAEmpresa = obraIdsEmpresa.includes(parte.obraId);
    if (!perteneceAEmpresa) return false;
    if (obraId && obraId !== 'all') {
      return parte.obraId === obraId;
    }
    return true;
  });
}

export async function getParteById(parteId: string, empresaId: string): Promise<Parte | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const parte = Cpartes.find(p => p.id === parteId);

  if (parte) {
    const obra = mockObras.find(o => o.id === parte.obraId);
    if (obra && obra.empresaId === empresaId) {
      return parte;
    }
  }
  return null;
}

export async function getParteByWorkerObraDate(
  usuarioId: string,
  obraId: string,
  fecha: Date,
  empresaId: string
): Promise<Parte | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const fechaString = fecha.toISOString().split('T')[0];
  
  const obra = mockObras.find(o => o.id === obraId && o.empresaId === empresaId);
  if (!obra) return null;

  const parte = Cpartes.find(
    (p) =>
      p.usuarioId === usuarioId &&
      p.obraId === obraId &&
      p.fecha.toISOString().split('T')[0] === fechaString
  );
  return parte || null;
}


export async function createParte(data: CreateParteData): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const validationResult = CreateParteInputSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Validation errors creating parte:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const validatedInputData = validationResult.data;

  const newParte: Parte = {
    id: `parte-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    usuarioId: validatedInputData.usuarioId,
    obraId: validatedInputData.obraId,
    fecha: validatedInputData.fecha,
    tareasRealizadas: validatedInputData.tareasRealizadas,
    horasTrabajadas: validatedInputData.horasTrabajadas === undefined ? null : validatedInputData.horasTrabajadas,
    incidencias: validatedInputData.incidencias || '',
    tareasSeleccionadas: validatedInputData.tareasSeleccionadas || [],
    fotosURLs: validatedInputData.fotosURLs || [],
    firmaURL: validatedInputData.firmaURL || null,
    validado: validatedInputData.validado !== undefined ? validatedInputData.validado : false,
    validadoPor: validatedInputData.validadoPor || undefined, // Use undefined if not provided for optional Zod field
    timestamp: new Date(),
    // dataAIHint se puede añadir si se desea
  };

  Cpartes.unshift(newParte);
  revalidatePath('/(app)/partes');
  revalidatePath(`/(app)/partes/new`);

  await new Promise(resolve => setTimeout(resolve, 100));

  return { success: true, message: 'Nuevo parte de trabajo registrado.', parte: newParte };
}


export async function updateParte(parteId: string, data: UpdateParteData): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const parteIndex = Cpartes.findIndex(p => p.id === parteId);
  if (parteIndex === -1) {
    return { success: false, message: 'Parte no encontrado.' };
  }

  const validationResult = UpdateParteDataSchema.safeParse(data);

  if (!validationResult.success) {
    console.error("Validation errors updating parte:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación al actualizar: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  Cpartes[parteIndex] = { ...Cpartes[parteIndex], ...validationResult.data };

  revalidatePath('/(app)/partes');
  revalidatePath(`/(app)/partes/${parteId}`);

  await new Promise(resolve => setTimeout(resolve, 100));
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

  const obraDelParte = mockObras.find(o => o.id === Cpartes[parteIndex].obraId);
  if (!obraDelParte || obraDelParte.empresaId !== validador.empresaId) {
      return { success: false, message: 'El validador no pertenece a la empresa de la obra.' };
  }

  Cpartes[parteIndex].validado = true;
  Cpartes[parteIndex].validadoPor = validadorId;

  revalidatePath('/(app)/partes');
  revalidatePath(`/(app)/partes/${parteId}`);

  await new Promise(resolve => setTimeout(resolve, 100)); // Reducido delay
  return { success: true, message: 'Parte validado con éxito.', parte: Cpartes[parteIndex] };
}
