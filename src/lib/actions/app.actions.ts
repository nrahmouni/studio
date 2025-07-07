// src/lib/actions/app.actions.ts
'use server';

import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora } from '../types';
import { mockProyectos, mockSubcontratas, mockTrabajadores, mockReportesDiarios, mockConstructoras } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';

// --- Data Fetching ---

export async function getConstructoras(): Promise<Constructora[]> {
  console.log("ACTION: getConstructoras (mocked)");
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockConstructoras;
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
  console.log("ACTION: getSubcontratas (mocked)");
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockSubcontratas;
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
    console.log(`ACTION: getProyectosByConstructora for ${constructoraId} (mocked)`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // This logic assumes a subcontrata can only work for one constructora on a given project.
    // We find the subcontratas that list this constructora as a client, then find their projects.
    const subcontratasAsociadas = mockSubcontratas.filter(s => s.clientesConstructoraIds?.includes(constructoraId));
    const subcontrataIds = subcontratasAsociadas.map(s => s.id);
    return mockProyectos.filter(p => subcontrataIds.includes(p.subcontrataId) && p.constructoraId === constructoraId);
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
  console.log(`ACTION: getProyectosBySubcontrata for ${subcontrataId} (mocked)`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockProyectos.filter(p => p.subcontrataId === subcontrataId);
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    console.log(`ACTION: getTrabajadoresByProyecto for ${proyectoId} (mocked)`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // The mock data has workers assigned directly to projects
    return mockTrabajadores.filter(t => t.proyectosAsignados?.includes(proyectoId));
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
    console.log(`ACTION: getReportesDiarios (mocked) for proyectoId: ${proyectoId}, encargadoId: ${encargadoId}, subcontrataId: ${subcontrataId}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    let reportes = mockReportesDiarios;
    if (proyectoId) {
        reportes = reportes.filter(r => r.proyectoId === proyectoId);
    }
    if (encargadoId) {
        reportes = reportes.filter(r => r.encargadoId === encargadoId);
    }
    if (subcontrataId) {
        const proyectosDeSub = mockProyectos.filter(p => p.subcontrataId === subcontrataId).map(p => p.id);
        reportes = reportes.filter(r => proyectosDeSub.includes(r.proyectoId));
    }
    return reportes;
}

// --- Data Mutation ---

export async function saveDailyReport(
  proyectoId: string,
  encargadoId: string,
  trabajadoresReporte: ReporteTrabajador[]
): Promise<{ success: boolean; message: string }> {
  
  console.log("ACTION: saveDailyReport (simulated)");
  console.log("Proyecto ID:", proyectoId);
  console.log("Encargado ID:", encargadoId);
  console.log("Reporte Data:", trabajadoresReporte);

  const newReport: ReporteDiario = {
      id: `rep-${uuidv4()}`,
      proyectoId,
      fecha: new Date(),
      trabajadores: trabajadoresReporte,
      encargadoId,
      timestamp: new Date(),
      validacion: {
          encargado: { validado: true, timestamp: new Date() },
          subcontrata: { validado: false, timestamp: null },
          constructora: { validado: false, timestamp: null },
      },
      modificacionJefeObra: {
          modificado: false,
          jefeObraId: null,
          timestamp: null,
          reporteOriginal: null,
      }
  };
  mockReportesDiarios.push(newReport);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Reporte diario guardado (simulación) con éxito.' };
}

export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
  console.log("ACTION: saveFichaje (simulated)");
  console.log("Data:", data);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: `Fichaje de ${data.tipo} guardado (simulación) con éxito.` };
}

export async function addTrabajadorToProyecto(proyectoId: string, subcontrataId: string, nombre: string, codigoAcceso: string): Promise<{success: boolean, message: string, trabajador?: Trabajador}> {
    console.log(`ACTION: addTrabajadorToProyecto (simulated)`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if worker with same code already exists for this subcontrata
    const existing = mockTrabajadores.find(t => t.codigoAcceso === codigoAcceso && t.subcontrataId === subcontrataId);
    if(existing) {
        // If worker exists, just add them to the project if not already there
        if (!existing.proyectosAsignados?.includes(proyectoId)) {
            existing.proyectosAsignados?.push(proyectoId);
            return { success: true, message: "Trabajador existente añadido al proyecto.", trabajador: existing };
        } else {
             return { success: false, message: "Este trabajador ya existe y está asignado a este proyecto."};
        }
    }

    // Create a new worker
    const newTrabajador: Trabajador = {
        id: `trab-${uuidv4()}`,
        nombre,
        subcontrataId,
        codigoAcceso,
        proyectosAsignados: [proyectoId]
    };
    mockTrabajadores.push(newTrabajador);
    return { success: true, message: "Nuevo trabajador creado y asignado.", trabajador: newTrabajador };
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{success: boolean, message: string}> {
    console.log(`ACTION: removeTrabajadorFromProyecto (simulated)`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const trabajador = mockTrabajadores.find(t => t.id === trabajadorId);
    if (trabajador && trabajador.proyectosAsignados) {
        const index = trabajador.proyectosAsignados.indexOf(proyectoId);
        if (index > -1) {
            trabajador.proyectosAsignados.splice(index, 1);
            return { success: true, message: "Trabajador eliminado del proyecto." };
        }
    }
    return { success: false, message: "No se pudo encontrar al trabajador o no estaba asignado a este proyecto."};
}
