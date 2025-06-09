
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FichajeSchema, type Fichaje, type FichajeTipo, GetFichajesCriteriaSchema, type GetFichajesCriteria } from '@/lib/types';
import { mockFichajes } from '@/lib/mockData/fichajes';
import { mockObras } from '../mockData/obras';
import { mockUsuarios } from '../mockData/usuarios';

let Cfichajes: Fichaje[] = [...mockFichajes];

const CreateFichajeDataSchema = z.object({
  usuarioId: z.string(),
  obraId: z.string(),
  tipo: FichajeSchema.shape.tipo,
});
type CreateFichajeData = z.infer<typeof CreateFichajeDataSchema>;

export async function createFichaje(data: CreateFichajeData): Promise<{ success: boolean; message: string; fichaje?: Fichaje }> {
  const validationResult = CreateFichajeDataSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const { usuarioId, obraId, tipo } = validationResult.data;

  const usuario = mockUsuarios.find(u => u.id === usuarioId);
  const obra = mockObras.find(o => o.id === obraId);

  if (!usuario) {
    return { success: false, message: 'Usuario no encontrado.' };
  }
  if (!obra) {
    return { success: false, message: 'Obra no encontrada.' };
  }
  if (usuario.empresaId !== obra.empresaId) {
      return { success: false, message: 'El usuario no pertenece a la empresa de la obra.'};
  }

  const newFichaje: Fichaje = {
    id: `fichaje-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    usuarioId,
    obraId,
    tipo,
    timestamp: new Date(),
    validado: false, 
    validadoPor: null,
  };

  Cfichajes.push(newFichaje);
  revalidatePath('/(app)/fichajes'); 

  await new Promise(resolve => setTimeout(resolve, 300)); 

  return { success: true, message: `Fichaje de ${tipo} registrado.`, fichaje: newFichaje };
}

export async function getFichajesHoyUsuarioObra(usuarioId: string, obraId: string): Promise<Fichaje[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); 

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); 
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1); 

  const fichajesFiltrados = Cfichajes.filter(f =>
    f.usuarioId === usuarioId &&
    f.obraId === obraId &&
    f.timestamp >= hoy &&
    f.timestamp < manana
  );

  return fichajesFiltrados.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

export async function getFichajesByCriteria(criteria: GetFichajesCriteria): Promise<Fichaje[]> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const validationResult = GetFichajesCriteriaSchema.safeParse(criteria);
  if (!validationResult.success) {
    console.error("Error de validación de criterios de fichaje:", validationResult.error.flatten().fieldErrors);
    return [];
  }
  const { empresaId, obraId, usuarioId, fechaInicio, fechaFin, estadoValidacion } = validationResult.data;

  // Get all obra IDs that belong to the specified empresaId
  let obrasPermitidasIds = mockObras
    .filter(o => o.empresaId === empresaId)
    .map(o => o.id);

  // If a specific obraId is provided in criteria, ensure it's valid for the company
  // and then filter by that specific obraId.
  if (obraId) {
    if (!obrasPermitidasIds.includes(obraId)) {
      return []; // The specified obraId does not belong to the company or doesn't exist.
    }
    obrasPermitidasIds = [obraId]; // Filter only for this specific obra
  }
  
  if (obrasPermitidasIds.length === 0) { // No obras match criteria (e.g. empresa has no obras or specific obraId not found)
    return [];
  }

  const filteredFichajes = Cfichajes.filter(f => {
    if (!obrasPermitidasIds.includes(f.obraId)) return false; // Must be within allowed obras
    if (usuarioId && f.usuarioId !== usuarioId) return false;
    if (fechaInicio && f.timestamp < fechaInicio) return false;
    if (fechaFin) {
      const endOfDay = new Date(fechaFin);
      endOfDay.setHours(23, 59, 59, 999);
      if (f.timestamp > endOfDay) return false;
    }
    if (estadoValidacion === 'validados' && !f.validado) return false;
    if (estadoValidacion === 'pendientes' && f.validado) return false;
    return true;
  });

  return filteredFichajes.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}


export async function validateFichaje(fichajeId: string, validadorId: string, empresaIdDelValidador: string): Promise<{ success: boolean; message: string; fichaje?: Fichaje }> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const fichajeIndex = Cfichajes.findIndex(f => f.id === fichajeId);
  if (fichajeIndex === -1) {
    return { success: false, message: 'Fichaje no encontrado.' };
  }
  const fichajeToValidate = Cfichajes[fichajeIndex];

  const validador = mockUsuarios.find(u => u.id === validadorId && (u.rol === 'admin' || u.rol === 'jefeObra'));
  if (!validador) {
    return { success: false, message: 'Usuario validador no encontrado o no autorizado.' };
  }

  if (validador.empresaId !== empresaIdDelValidador) {
    return { success: false, message: 'El validador no pertenece a la empresa que intenta validar.' };
  }

  const obraDelFichaje = mockObras.find(o => o.id === fichajeToValidate.obraId);
  if (!obraDelFichaje) {
    return { success: false, message: 'La obra asociada al fichaje no fue encontrada.' };
  }
  
  if (obraDelFichaje.empresaId !== empresaIdDelValidador) {
    return { success: false, message: 'El fichaje no pertenece a una obra de la empresa del validador.' };
  }

  Cfichajes[fichajeIndex].validado = true;
  Cfichajes[fichajeIndex].validadoPor = validadorId;

  revalidatePath('/(app)/fichajes');

  return { success: true, message: 'Fichaje validado con éxito.', fichaje: Cfichajes[fichajeIndex] };
}
