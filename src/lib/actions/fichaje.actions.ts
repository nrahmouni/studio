
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FichajeSchema, type Fichaje, type FichajeTipo } from '@/lib/types';
import { mockFichajes } from '@/lib/mockData/fichajes';
import { mockObras } from '../mockData/obras';
import { mockUsuarios } from '../mockData/usuarios';

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

  // Validate user and obra existence (important in a real scenario)
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
  };

  mockFichajes.push(newFichaje);
  revalidatePath('/(app)/fichajes'); // Revalidate the fichajes page

  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

  return { success: true, message: `Fichaje de ${tipo} registrado.`, fichaje: newFichaje };
}

export async function getFichajesHoyUsuarioObra(usuarioId: string, obraId: string): Promise<Fichaje[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Start of today
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1); // Start of tomorrow

  const fichajesFiltrados = mockFichajes.filter(f =>
    f.usuarioId === usuarioId &&
    f.obraId === obraId &&
    f.timestamp >= hoy &&
    f.timestamp < manana
  );

  return fichajesFiltrados.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
