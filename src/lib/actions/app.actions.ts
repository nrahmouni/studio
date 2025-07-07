// src/lib/actions/app.actions.ts
'use server';

import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador } from '../types';
import { mockProyectos, mockSubcontratas, mockTrabajadores } from '@/lib/mockData';

// --- Data Fetching for Encargado (NOW MOCKED) ---

export async function getSubcontratas(): Promise<Subcontrata[]> {
  console.log("ACTION: getSubcontratas (mocked)");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockSubcontratas;
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
  console.log(`ACTION: getProyectosBySubcontrata for ${subcontrataId} (mocked)`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockProyectos.filter(p => p.subcontrataId === subcontrataId);
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    console.log(`ACTION: getTrabajadoresByProyecto for ${proyectoId} (mocked)`);
    await new Promise(resolve => setTimeout(resolve, 300));
    const workers = mockTrabajadores.filter(t => t.proyectosAsignados?.includes(proyectoId));
    return workers;
}

// --- Report Submission (SIMULATED) ---

export async function saveDailyReport(
  proyectoId: string,
  encargadoId: string,
  trabajadoresReporte: ReporteTrabajador[]
): Promise<{ success: boolean; message: string }> {
  
  console.log("ACTION: saveDailyReport (simulated)");
  console.log("Proyecto ID:", proyectoId);
  console.log("Encargado ID:", encargadoId);
  console.log("Reporte Data:", trabajadoresReporte);
  
  // Simulate network delay and success
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real scenario, you'd perform validation and Firestore operations here.
  
  return { success: true, message: 'Reporte diario guardado (simulación) con éxito.' };
}

// --- Fichaje Submission (SIMULATED) ---
export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
  console.log("ACTION: saveFichaje (simulated)");
  console.log("Data:", data);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: `Fichaje de ${data.tipo} guardado (simulación) con éxito.` };
}
