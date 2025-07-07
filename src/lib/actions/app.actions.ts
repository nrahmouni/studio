// src/lib/actions/app.actions.ts
'use server';

import {
  mockConstructoras,
  mockSubcontratas,
  mockProyectos,
  mockTrabajadores,
  mockReportesDiarios,
} from '@/lib/mockData';
import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora } from '../types';

// NOTE: Since we are using mock data, mutations (save, update, add, remove) will not persist after a page reload.
// They will return a success message to simulate the action for UI feedback.

// --- Data Fetching ---

export async function getConstructoras(): Promise<Constructora[]> {
  console.log("ACTION: getConstructoras (Mock)");
  return JSON.parse(JSON.stringify(mockConstructoras));
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
  console.log("ACTION: getSubcontratas (Mock)");
  return JSON.parse(JSON.stringify(mockSubcontratas));
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
  console.log(`ACTION: getProyectosByConstructora for ${constructoraId} (Mock)`);
  return JSON.parse(JSON.stringify(mockProyectos.filter(p => p.constructoraId === constructoraId)));
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
    console.log(`ACTION: getProyectosBySubcontrata for ${subcontrataId} (Mock)`);
    return JSON.parse(JSON.stringify(mockProyectos.filter(p => p.subcontrataId === subcontrataId)));
}


export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
  console.log(`ACTION: getTrabajadoresByProyecto for ${proyectoId} (Mock)`);
  return JSON.parse(JSON.stringify(mockTrabajadores.filter(t => t.proyectosAsignados.includes(proyectoId))));
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
    console.log(`ACTION: getReportesDiarios (Mock) for proyectoId: ${proyectoId}, encargadoId: ${encargadoId}, subcontrataId: ${subcontrataId}`);
    let reportes = JSON.parse(JSON.stringify(mockReportesDiarios));

    if (proyectoId) {
        reportes = reportes.filter((r: ReporteDiario) => r.proyectoId === proyectoId);
    }
    if (encargadoId) {
        reportes = reportes.filter((r: ReporteDiario) => r.encargadoId === encargadoId);
    }
    
    if (subcontrataId) {
        const proyectosDeSubIds = mockProyectos
            .filter(p => p.subcontrataId === subcontrataId)
            .map(p => p.id);
        reportes = reportes.filter((r: ReporteDiario) => proyectosDeSubIds.includes(r.proyectoId));
    }
    
    // Convert string dates to Date objects
    reportes.forEach((r: any) => { // Use any to bypass strict typing for date conversion
        r.fecha = new Date(r.fecha);
        r.timestamp = new Date(r.timestamp);
        if(r.validacion.encargado.timestamp) r.validacion.encargado.timestamp = new Date(r.validacion.encargado.timestamp);
        if(r.validacion.subcontrata.timestamp) r.validacion.subcontrata.timestamp = new Date(r.validacion.subcontrata.timestamp);
        if(r.validacion.constructora.timestamp) r.validacion.constructora.timestamp = new Date(r.validacion.constructora.timestamp);
        if(r.modificacionJefeObra?.timestamp) r.modificacionJefeObra.timestamp = new Date(r.modificacionJefeObra.timestamp);
    });

    return reportes;
}

export async function getReporteDiarioById(reporteId: string): Promise<ReporteDiario | null> {
    console.log(`ACTION: getReporteDiarioById for ${reporteId} (Mock)`);
    const reporte = mockReportesDiarios.find(r => r.id === reporteId);
    if (!reporte) return null;

    const reporteCopy: any = JSON.parse(JSON.stringify(reporte));
    reporteCopy.fecha = new Date(reporteCopy.fecha);
    reporteCopy.timestamp = new Date(reporteCopy.timestamp);
    if(reporteCopy.validacion.encargado.timestamp) reporteCopy.validacion.encargado.timestamp = new Date(reporteCopy.validacion.encargado.timestamp);
    if(reporteCopy.validacion.subcontrata.timestamp) reporteCopy.validacion.subcontrata.timestamp = new Date(reporteCopy.validacion.subcontrata.timestamp);
    if(reporteCopy.validacion.constructora.timestamp) reporteCopy.validacion.constructora.timestamp = new Date(reporteCopy.validacion.constructora.timestamp);
    if(reporteCopy.modificacionJefeObra?.timestamp) reporteCopy.modificacionJefeObra.timestamp = new Date(reporteCopy.modificacionJefeObra.timestamp);
    
    return reporteCopy;
}

// --- Data Mutation (Simulated) ---

export async function saveDailyReport(
  proyectoId: string,
  encargadoId: string,
  trabajadoresReporte: ReporteTrabajador[],
  comentarios: string
): Promise<{ success: boolean; message: string }> {
  console.log("ACTION: saveDailyReport (Mocked)", { proyectoId, encargadoId, trabajadoresReporte, comentarios });
  // In a mock environment, we can't modify the source file.
  // We just simulate a successful operation.
  return { success: true, message: 'Reporte diario guardado con éxito (simulado).' };
}

export async function updateDailyReport(
  reporteId: string,
  trabajadoresReporte: ReporteTrabajador[]
): Promise<{ success: boolean; message: string, reporte?: ReporteDiario }> {
    console.log(`ACTION: updateDailyReport for ${reporteId} (Mocked)`);
    const originalReporte = await getReporteDiarioById(reporteId);
    if (!originalReporte) {
      return { success: false, message: 'Reporte no encontrado para actualizar.' };
    }
    
    const updatedReporte: ReporteDiario = {
        ...originalReporte,
        trabajadores: trabajadoresReporte,
        timestamp: new Date()
    };

    return { success: true, message: 'Reporte actualizado con éxito (simulado).', reporte: updatedReporte };
}

export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
  console.log("ACTION: saveFichaje (Mocked)");
  return { success: true, message: `Fichaje de ${data.tipo} guardado con éxito (simulado).` };
}

export async function addTrabajadorToProyecto(proyectoId: string, subcontrataId: string, nombre: string, codigoAcceso: string): Promise<{success: boolean, message: string, trabajador?: Trabajador}> {
    console.log(`ACTION: addTrabajadorToProyecto (Mocked)`);
    const newTrabajador: Trabajador = {
        id: `trab-mock-${Math.random()}`,
        nombre,
        subcontrataId,
        codigoAcceso,
        proyectosAsignados: [proyectoId]
    };
    return { success: true, message: "Nuevo trabajador creado y asignado (simulado).", trabajador: newTrabajador };
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{success: boolean, message: string}> {
    console.log(`ACTION: removeTrabajadorFromProyecto (Mocked)`);
    return { success: true, message: "Trabajador eliminado del proyecto (simulado)." };
}

export async function validateDailyReport(
  reporteId: string,
  role: 'subcontrata' | 'constructora'
): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    console.log(`ACTION: validateDailyReport for ${reporteId} by ${role} (Mocked)`);
    const originalReporte = await getReporteDiarioById(reporteId);

    if (!originalReporte) {
        return { success: false, message: 'Reporte no encontrado.' };
    }
    
    if (role === 'subcontrata') {
      if (!originalReporte.validacion.encargado.validado) {
          return { success: false, message: 'El reporte debe ser validado primero por el Encargado.' };
      }
      originalReporte.validacion.subcontrata = { validado: true, timestamp: new Date() };
    } else if (role === 'constructora') {
       if (!originalReporte.validacion.subcontrata.validado) {
          return { success: false, message: 'El reporte debe ser validado primero por la Subcontrata.' };
      }
      originalReporte.validacion.constructora = { validado: true, timestamp: new Date() };
    }

    return { success: true, message: `Reporte validado por ${role} con éxito (simulado).`, reporte: originalReporte };
}
