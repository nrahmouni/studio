// src/lib/actions/app.actions.ts
'use server';

import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora, Maquinaria } from '../types';
import { 
    mockConstructoras, mockSubcontratas, mockProyectos, mockTrabajadores, mockMaquinaria, mockReportesDiarios, mockFichajes 
} from '../mockData';

// Helper para simular latencia de red
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- DATA FETCHING ---

export async function getConstructoras(): Promise<Constructora[]> {
    await delay(150);
    return JSON.parse(JSON.stringify(mockConstructoras));
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
    await delay(150);
    return JSON.parse(JSON.stringify(mockSubcontratas));
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(mockProyectos.filter(p => p.constructoraId === constructoraId)));
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(mockProyectos.filter(p => p.subcontrataId === subcontrataId)));
}

export async function getProyectoById(proyectoId: string): Promise<Proyecto | null> {
    await delay(100);
    const proyecto = mockProyectos.find(p => p.id === proyectoId) || null;
    return proyecto ? JSON.parse(JSON.stringify(proyecto)) : null;
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(mockTrabajadores.filter(t => t.proyectosAsignados?.includes(proyectoId))));
}

export async function getMaquinariaByProyecto(proyectoId: string): Promise<Maquinaria[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(mockMaquinaria.filter(m => m.proyectosAsignados?.includes(proyectoId))));
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
    await delay(300);
    let reportes = JSON.parse(JSON.stringify(mockReportesDiarios));
    
    if (proyectoId) {
        reportes = reportes.filter((r: ReporteDiario) => r.proyectoId === proyectoId);
    }
    if (encargadoId) {
        reportes = reportes.filter((r: ReporteDiario) => r.encargadoId === encargadoId);
    }
    if (subcontrataId) {
        const proyectosDeSub = mockProyectos.filter(p => p.subcontrataId === subcontrataId).map(p => p.id);
        reportes = reportes.filter((r: ReporteDiario) => proyectosDeSub.includes(r.proyectoId));
    }
    return reportes;
}

export async function getReporteDiarioById(reporteId: string): Promise<ReporteDiario | null> {
    await delay(100);
    const reporte = mockReportesDiarios.find(r => r.id === reporteId) || null;
    return reporte ? JSON.parse(JSON.stringify(reporte)) : null;
}

export async function getTrabajadoresBySubcontrata(subcontrataId: string): Promise<Trabajador[]> {
    await delay(200);
    return JSON.parse(JSON.stringify(mockTrabajadores.filter(t => t.subcontrataId === subcontrataId)));
}

export async function getMaquinariaBySubcontrata(subcontrataId: string): Promise<Maquinaria[]> {
     await delay(200);
    return JSON.parse(JSON.stringify(mockMaquinaria.filter(m => m.subcontrataId === m.subcontrataId)));
}

// --- DATA MUTATION ---

export async function addProyecto(data: Omit<Proyecto, 'id'>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    console.log('[ACTION] addProyecto started.');
    await delay(400);
    try {
        const newProyecto: Proyecto = {
            id: `proy-mock-${Date.now()}`,
            ...data,
        };
        mockProyectos.unshift(newProyecto);
        console.log('[ACTION] addProyecto successful.');
        return { success: true, message: 'Proyecto añadido con éxito.', proyecto: JSON.parse(JSON.stringify(newProyecto)) };
    } catch(e: any) {
        console.error('[ACTION] addProyecto failed:', e);
        return { success: false, message: e.message || 'Error al añadir proyecto.' };
    }
}

export async function updateProyecto(proyectoId: string, data: Partial<Omit<Proyecto, 'id'>>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    console.log(`[ACTION] updateProyecto started for ID: ${proyectoId}.`);
    await delay(300);
    try {
        const index = mockProyectos.findIndex(p => p.id === proyectoId);
        if (index === -1) {
            console.error(`[ACTION] updateProyecto failed: Project with ID ${proyectoId} not found.`);
            return { success: false, message: 'Proyecto no encontrado.' };
        }
        mockProyectos[index] = { ...mockProyectos[index], ...data };
        console.log(`[ACTION] updateProyecto successful for ID: ${proyectoId}.`);
        return { success: true, message: 'Proyecto actualizado.', proyecto: JSON.parse(JSON.stringify(mockProyectos[index])) };
    } catch (e: any) {
        console.error(`[ACTION] updateProyecto failed for ID: ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al actualizar el proyecto.' };
    }
}

export async function saveDailyReport(proyectoId: string, encargadoId: string, trabajadoresReporte: ReporteTrabajador[], comentarios: string): Promise<{ success: boolean; message: string }> {
    console.log('[ACTION] saveDailyReport started.');
    await delay(500);
    try {
        const newReporte: ReporteDiario = {
            id: `rep-mock-${Date.now()}`,
            proyectoId,
            encargadoId,
            fecha: new Date(),
            timestamp: new Date(),
            trabajadores: trabajadoresReporte,
            comentarios,
            validacion: {
                encargado: { validado: true, timestamp: new Date() },
                subcontrata: { validado: false, timestamp: null },
                constructora: { validado: false, timestamp: null },
            },
        };
        mockReportesDiarios.unshift(newReporte);
        console.log('[ACTION] saveDailyReport successful.');
        return { success: true, message: 'Reporte diario guardado con éxito.' };
    } catch (e: any) {
        console.error('[ACTION] saveDailyReport failed:', e);
        return { success: false, message: e.message || 'Error al guardar el reporte.' };
    }
}

export async function updateDailyReport(reporteId: string, trabajadoresReporte: ReporteTrabajador[]): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    console.log(`[ACTION] updateDailyReport started for ID: ${reporteId}.`);
    await delay(300);
    try {
        const index = mockReportesDiarios.findIndex(r => r.id === reporteId);
        if (index === -1) {
            console.error(`[ACTION] updateDailyReport failed: Report with ID ${reporteId} not found.`);
            return { success: false, message: 'Reporte no encontrado.' };
        }
        mockReportesDiarios[index].trabajadores = trabajadoresReporte;
        mockReportesDiarios[index].modificacionJefeObra = {
            modificado: true,
            jefeObraId: 'jefe-obra-mock-id',
            timestamp: new Date(),
            reporteOriginal: '[]' // Mocked
        };
        console.log(`[ACTION] updateDailyReport successful for ID: ${reporteId}.`);
        return { success: true, message: 'Reporte actualizado.', reporte: JSON.parse(JSON.stringify(mockReportesDiarios[index])) };
    } catch (e: any) {
        console.error(`[ACTION] updateDailyReport failed for ID: ${reporteId}:`, e);
        return { success: false, message: e.message || 'Error al actualizar el reporte.' };
    }
}

export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
    console.log('[ACTION] saveFichaje started.');
    await delay(200);
    try {
        const newFichaje = { id: `fichaje-mock-${Date.now()}`, ...data, timestamp: new Date() };
        mockFichajes.push(newFichaje);
        console.log('[ACTION] saveFichaje successful.');
        return { success: true, message: `Fichaje de ${data.tipo} guardado.` };
    } catch (e: any) {
        console.error('[ACTION] saveFichaje failed:', e);
        return { success: false, message: e.message || 'Error al guardar el fichaje.' };
    }
}

export async function addTrabajador(data: { subcontrataId: string, nombre: string, categoriaProfesional: Trabajador['categoriaProfesional'], codigoAcceso: string }): Promise<{ success: boolean, message: string, trabajador?: Trabajador }> {
    console.log('[ACTION] addTrabajador started.');
    await delay(300);
    try {
        const newTrabajador: Trabajador = {
            id: `trab-mock-${Date.now()}`,
            proyectosAsignados: [],
            ...data,
        };
        mockTrabajadores.push(newTrabajador);
        console.log('[ACTION] addTrabajador successful.');
        return { success: true, message: "Trabajador añadido.", trabajador: JSON.parse(JSON.stringify(newTrabajador)) };
    } catch (e: any) {
        console.error('[ACTION] addTrabajador failed:', e);
        return { success: false, message: e.message || 'Error al añadir trabajador.' };
    }
}

export async function removeTrabajador(trabajadorId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION] removeTrabajador started for ID: ${trabajadorId}.`);
    await delay(300);
    try {
        const index = mockTrabajadores.findIndex(t => t.id === trabajadorId);
        if (index === -1) {
            console.error(`[ACTION] removeTrabajador failed: Worker with ID ${trabajadorId} not found.`);
            return { success: false, message: "Trabajador no encontrado." };
        }
        mockTrabajadores.splice(index, 1);
        console.log(`[ACTION] removeTrabajador successful for ID: ${trabajadorId}.`);
        return { success: true, message: "Trabajador eliminado." };
    } catch (e: any) {
        console.error(`[ACTION] removeTrabajador failed for ID: ${trabajadorId}:`, e);
        return { success: false, message: e.message || 'Error al eliminar trabajador.' };
    }
}

export async function addMaquinaria(data: { subcontrataId: string, nombre: string, matriculaORef: string }): Promise<{ success: boolean, message: string, maquinaria?: Maquinaria }> {
    console.log('[ACTION] addMaquinaria started.');
    await delay(300);
    try {
        const newMaquinaria: Maquinaria = {
            id: `maq-mock-${Date.now()}`,
            proyectosAsignados: [],
            ...data,
        };
        mockMaquinaria.push(newMaquinaria);
        console.log('[ACTION] addMaquinaria successful.');
        return { success: true, message: "Maquinaria añadida.", maquinaria: JSON.parse(JSON.stringify(newMaquinaria)) };
    } catch (e: any) {
        console.error('[ACTION] addMaquinaria failed:', e);
        return { success: false, message: e.message || 'Error al añadir maquinaria.' };
    }
}

export async function removeMaquinaria(maquinariaId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION] removeMaquinaria started for ID: ${maquinariaId}.`);
    await delay(300);
    try {
        const index = mockMaquinaria.findIndex(m => m.id === maquinariaId);
        if (index === -1) {
            console.error(`[ACTION] removeMaquinaria failed: Machinery with ID ${maquinariaId} not found.`);
            return { success: false, message: "Maquinaria no encontrada." };
        }
        mockMaquinaria.splice(index, 1);
        console.log(`[ACTION] removeMaquinaria successful for ID: ${maquinariaId}.`);
        return { success: true, message: "Maquinaria eliminada." };
    } catch (e: any) {
        console.error(`[ACTION] removeMaquinaria failed for ID: ${maquinariaId}:`, e);
        return { success: false, message: e.message || 'Error al eliminar maquinaria.' };
    }
}

export async function assignTrabajadoresToProyecto(proyectoId: string, trabajadorIds: string[]): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION] assignTrabajadoresToProyecto started for project ${proyectoId}.`);
    await delay(400);
    try {
        trabajadorIds.forEach(id => {
            const trabajador = mockTrabajadores.find(t => t.id === id);
            if (trabajador && !trabajador.proyectosAsignados?.includes(proyectoId)) {
                trabajador.proyectosAsignados?.push(proyectoId);
            }
        });
        console.log(`[ACTION] assignTrabajadoresToProyecto successful for project ${proyectoId}.`);
        return { success: true, message: "Personal asignado." };
    } catch (e: any) {
        console.error(`[ACTION] assignTrabajadoresToProyecto failed for project ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al asignar personal.' };
    }
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION] removeTrabajadorFromProyecto started for project ${proyectoId}, worker ${trabajadorId}.`);
    await delay(200);
    try {
        const trabajador = mockTrabajadores.find(t => t.id === trabajadorId);
        if (trabajador && trabajador.proyectosAsignados) {
            const index = trabajador.proyectosAsignados.indexOf(proyectoId);
            if (index > -1) {
                trabajador.proyectosAsignados.splice(index, 1);
            }
        }
        console.log(`[ACTION] removeTrabajadorFromProyecto successful for project ${proyectoId}, worker ${trabajadorId}.`);
        return { success: true, message: "Trabajador desvinculado." };
    } catch (e: any) {
        console.error(`[ACTION] removeTrabajadorFromProyecto failed for project ${proyectoId}, worker ${trabajadorId}:`, e);
        return { success: false, message: e.message || 'Error al desvincular trabajador.' };
    }
}

export async function assignMaquinariaToProyecto(proyectoId: string, maquinariaIds: string[]): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION] assignMaquinariaToProyecto started for project ${proyectoId}.`);
    await delay(400);
    try {
        maquinariaIds.forEach(id => {
            const maquina = mockMaquinaria.find(m => m.id === id);
            if (maquina && !maquina.proyectosAsignados?.includes(proyectoId)) {
                maquina.proyectosAsignados?.push(proyectoId);
            }
        });
        console.log(`[ACTION] assignMaquinariaToProyecto successful for project ${proyectoId}.`);
        return { success: true, message: "Maquinaria asignada." };
    } catch (e: any) {
        console.error(`[ACTION] assignMaquinariaToProyecto failed for project ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al asignar maquinaria.' };
    }
}

export async function removeMaquinariaFromProyecto(proyectoId: string, maquinariaId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION] removeMaquinariaFromProyecto started for project ${proyectoId}, machinery ${maquinariaId}.`);
    await delay(200);
    try {
        const maquina = mockMaquinaria.find(m => m.id === maquinariaId);
        if (maquina && maquina.proyectosAsignados) {
            const index = maquina.proyectosAsignados.indexOf(proyectoId);
            if (index > -1) {
                maquina.proyectosAsignados.splice(index, 1);
            }
        }
        console.log(`[ACTION] removeMaquinariaFromProyecto successful for project ${proyectoId}, machinery ${maquinariaId}.`);
        return { success: true, message: "Maquinaria desvinculada." };
    } catch (e: any) {
        console.error(`[ACTION] removeMaquinariaFromProyecto failed for project ${proyectoId}, machinery ${maquinariaId}:`, e);
        return { success: false, message: e.message || 'Error al desvincular maquinaria.' };
    }
}

export async function validateDailyReport(reporteId: string, role: 'subcontrata' | 'constructora'): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    console.log(`[ACTION] validateDailyReport started for ID: ${reporteId} by role: ${role}.`);
    await delay(300);
    try {
        const index = mockReportesDiarios.findIndex(r => r.id === reporteId);
        if (index === -1) {
            console.error(`[ACTION] validateDailyReport failed: Report with ID ${reporteId} not found.`);
            return { success: false, message: 'Reporte no encontrado.' };
        }
        const reporte = mockReportesDiarios[index];
        if (role === 'subcontrata') {
            reporte.validacion.subcontrata = { validado: true, timestamp: new Date() };
        } else if (role === 'constructora') {
            reporte.validacion.constructora = { validado: true, timestamp: new Date() };
        }
        console.log(`[ACTION] validateDailyReport successful for ID: ${reporteId}.`);
        return { success: true, message: `Reporte validado por ${role}.`, reporte: JSON.parse(JSON.stringify(reporte)) };
    } catch (e: any) {
        console.error(`[ACTION] validateDailyReport failed for ID: ${reporteId}:`, e);
        return { success: false, message: e.message || 'Error al validar el reporte.' };
    }
}