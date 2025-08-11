
// src/lib/actions/app.actions.ts
'use server';

import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora, Maquinaria } from '../types';
import { 
    mockConstructoras, mockSubcontratas, mockProyectos, mockTrabajadores, mockMaquinaria, mockReportesDiarios, mockFichajes
} from '../mockData';
import { parseISO } from 'date-fns';

// Helper para simular latencia de red
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const parseProyectos = (proyectos: any[]): Proyecto[] => {
    return proyectos.map(p => ({
        ...p,
        fechaInicio: p.fechaInicio ? parseISO(p.fechaInicio) : null,
        fechaFin: p.fechaFin ? parseISO(p.fechaFin) : null,
    }));
}

const parseReportes = (reportes: any[]): ReporteDiario[] => {
    return reportes.map(r => ({
        ...r,
        fecha: r.fecha ? parseISO(r.fecha) : new Date(),
        timestamp: r.timestamp ? parseISO(r.timestamp) : new Date(),
        validacion: {
            encargado: {
                validado: r.validacion?.encargado?.validado || false,
                timestamp: r.validacion?.encargado?.timestamp ? parseISO(r.validacion.encargado.timestamp) : null,
            },
            subcontrata: {
                validado: r.validacion?.subcontrata?.validado || false,
                timestamp: r.validacion?.subcontrata?.timestamp ? parseISO(r.validacion.subcontrata.timestamp) : null,
            },
            constructora: {
                validado: r.validacion?.constructora?.validado || false,
                timestamp: r.validacion?.constructora?.timestamp ? parseISO(r.validacion.constructora.timestamp) : null,
            },
        },
        modificacionJefeObra: r.modificacionJefeObra ? {
            ...r.modificacionJefeObra,
            timestamp: r.modificacionJefeObra.timestamp ? parseISO(r.modificacionJefeObra.timestamp) : null,
        } : undefined,
    }));
}


/**
 * Checks if the initial demo data from JSON files has been loaded into memory correctly.
 * This is a debugging tool to show a client-side error if the server failed to read local files.
 */
export async function getInitialDataLoadStatus(): Promise<{ success: boolean; message?: string }> {
    console.log('[ACTION LOG] getInitialDataLoadStatus called');
    const dataSets = {
        constructoras: mockConstructoras,
        subcontratas: mockSubcontratas,
        proyectos: mockProyectos,
        trabajadores: mockTrabajadores,
    };
    const unloadedSets = Object.entries(dataSets).filter(([, data]) => data.length === 0);

    if (unloadedSets.length > 0) {
        const unloadedNames = unloadedSets.map(([name]) => name).join(', ');
        const errorMessage = `Error Crítico: Los siguientes archivos de datos de demostración no se pudieron cargar: ${unloadedNames}.json. Revisa los logs del servidor para ver el error de lectura del archivo.`;
        console.error(`[Data Load Status]: ${errorMessage}`);
        return {
            success: false,
            message: errorMessage,
        };
    }
    console.log('[ACTION LOG] getInitialDataLoadStatus: All data sets loaded correctly.');
    return { success: true };
}


// --- DATA FETCHING ---

export async function getConstructoras(): Promise<Constructora[]> {
    console.log('[ACTION LOG] getConstructoras called');
    await delay(50);
    return JSON.parse(JSON.stringify(mockConstructoras));
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
    console.log('[ACTION LOG] getSubcontratas called');
    await delay(50);
    return JSON.parse(JSON.stringify(mockSubcontratas));
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
    console.log(`[ACTION LOG] getProyectosByConstructora called with constructoraId: ${constructoraId}`);
    await delay(100);
    const proyectos = mockProyectos.filter(p => p.constructoraId === constructoraId);
    console.log(`[ACTION LOG] Found ${proyectos.length} proyectos for constructoraId: ${constructoraId}`);
    return parseProyectos(JSON.parse(JSON.stringify(proyectos)));
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
    console.log(`[ACTION LOG] getProyectosBySubcontrata called with subcontrataId: ${subcontrataId}`);
    await delay(100);
    const proyectos = mockProyectos.filter(p => p.subcontrataId === subcontrataId);
    console.log(`[ACTION LOG] Found ${proyectos.length} proyectos for subcontrataId: ${subcontrataId}`);
    return parseProyectos(JSON.parse(JSON.stringify(proyectos)));
}

export async function getProyectoById(proyectoId: string): Promise<Proyecto | null> {
    console.log(`[ACTION LOG] getProyectoById called with proyectoId: ${proyectoId}`);
    await delay(50);
    const proyecto = mockProyectos.find(p => p.id === proyectoId) || null;
    console.log(`[ACTION LOG] Found proyecto: ${!!proyecto}`);
    return proyecto ? parseProyectos([JSON.parse(JSON.stringify(proyecto))])[0] : null;
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    console.log(`[ACTION LOG] getTrabajadoresByProyecto called with proyectoId: ${proyectoId}`);
    await delay(100);
    const trabajadores = mockTrabajadores.filter(t => t.proyectosAsignados?.includes(proyectoId));
    console.log(`[ACTION LOG] Found ${trabajadores.length} trabajadores for proyectoId: ${proyectoId}`);
    return JSON.parse(JSON.stringify(trabajadores));
}

export async function getMaquinariaByProyecto(proyectoId: string): Promise<Maquinaria[]> {
    console.log(`[ACTION LOG] getMaquinariaByProyecto called with proyectoId: ${proyectoId}`);
    await delay(100);
    const maquinaria = mockMaquinaria.filter(m => m.proyectosAsignados?.includes(proyectoId));
    console.log(`[ACTION LOG] Found ${maquinaria.length} maquinaria for proyectoId: ${proyectoId}`);
    return JSON.parse(JSON.stringify(maquinaria));
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
    console.log(`[ACTION LOG] getReportesDiarios called with filters: proyectoId=${proyectoId}, encargadoId=${encargadoId}, subcontrataId=${subcontrataId}`);
    await delay(150);
    let reportes = [...mockReportesDiarios];
    
    if (proyectoId) {
        reportes = reportes.filter((r: any) => r.proyectoId === proyectoId);
    }
    if (encargadoId) {
        reportes = reportes.filter((r: any) => r.encargadoId === encargadoId);
    }
    if (subcontrataId) {
        const proyectosDeSub = mockProyectos.filter(p => p.subcontrataId === subcontrataId).map(p => p.id);
        reportes = reportes.filter((r: any) => proyectosDeSub.includes(r.proyectoId));
    }
    console.log(`[ACTION LOG] Found ${reportes.length} reportes with applied filters.`);
    return parseReportes(JSON.parse(JSON.stringify(reportes)));
}

export async function getReportesDiariosByConstructora(constructoraId: string): Promise<ReporteDiario[]> {
    console.log(`[ACTION LOG] getReportesDiariosByConstructora called with constructoraId: ${constructoraId}`);
    await delay(150);
    let reportes = [...mockReportesDiarios];
    
    const proyectosDeConstructora = mockProyectos.filter(p => p.constructoraId === constructoraId).map(p => p.id);
    reportes = reportes.filter((r: any) => proyectosDeConstructora.includes(r.proyectoId));
    console.log(`[ACTION LOG] Found ${reportes.length} reportes for constructoraId: ${constructoraId}`);
    return parseReportes(JSON.parse(JSON.stringify(reportes)));
}

export async function getReporteDiarioById(reporteId: string): Promise<ReporteDiario | null> {
    console.log(`[ACTION LOG] getReporteDiarioById called with reporteId: ${reporteId}`);
    await delay(50);
    const reporte = mockReportesDiarios.find(r => r.id === reporteId) || null;
    console.log(`[ACTION LOG] Found reporte: ${!!reporte}`);
    return reporte ? parseReportes([JSON.parse(JSON.stringify(reporte))])[0] : null;
}

export async function getTrabajadoresBySubcontrata(subcontrataId: string): Promise<Trabajador[]> {
    console.log(`[ACTION LOG] getTrabajadoresBySubcontrata called with subcontrataId: ${subcontrataId}`);
    await delay(100);
    const trabajadores = mockTrabajadores.filter(t => t.subcontrataId === subcontrataId);
    console.log(`[ACTION LOG] Found ${trabajadores.length} trabajadores for subcontrataId: ${subcontrataId}`);
    return JSON.parse(JSON.stringify(trabajadores));
}

export async function getMaquinariaBySubcontrata(subcontrataId: string): Promise<Maquinaria[]> {
    console.log(`[ACTION LOG] getMaquinariaBySubcontrata called with subcontrataId: ${subcontrataId}`);
    await delay(100);
    const maquinaria = mockMaquinaria.filter(m => m.subcontrataId === subcontrataId);
    console.log(`[ACTION LOG] Found ${maquinaria.length} maquinaria for subcontrataId: ${subcontrataId}`);
    return JSON.parse(JSON.stringify(maquinaria));
}

// --- DATA MUTATION ---

export async function addEmpresa(data: { empresaNombre: string }): Promise<{ success: boolean; message: string; empresa?: Constructora }> {
    console.log('[ACTION LOG] addEmpresa called with data:', data);
    await delay(200);
    try {
        const newEmpresa: Constructora = {
            id: `const-mock-${Date.now()}`,
            nombre: data.empresaNombre,
        };
        mockConstructoras.unshift(newEmpresa);
        console.log('[ACTION LOG] addEmpresa successful. New empresa:', newEmpresa);
        return { success: true, message: 'Empresa añadida con éxito.', empresa: JSON.parse(JSON.stringify(newEmpresa)) };
    } catch(e: any) {
        console.error("[ACTION LOG] Error in addEmpresa:", e);
        return { success: false, message: e.message || 'Error al añadir empresa.' };
    }
}


export async function addProyecto(data: Omit<Proyecto, 'id'>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    console.log('[ACTION LOG] addProyecto called with data:', data);
    await delay(200);
    try {
        const newProyecto: any = { 
            id: `proy-mock-${Date.now()}`,
            ...data,
            fechaInicio: data.fechaInicio ? (data.fechaInicio as Date).toISOString() : null,
            fechaFin: data.fechaFin ? (data.fechaFin as Date).toISOString() : null,
        };
        mockProyectos.unshift(newProyecto);
        console.log('[ACTION LOG] addProyecto successful. New proyecto:', newProyecto);
        return { success: true, message: 'Proyecto añadido con éxito.', proyecto: parseProyectos([JSON.parse(JSON.stringify(newProyecto))])[0] };
    } catch(e: any) {
        console.error("[ACTION LOG] Error in addProyecto:", e);
        return { success: false, message: e.message || 'Error al añadir proyecto.' };
    }
}

export async function updateProyecto(proyectoId: string, data: Partial<Omit<Proyecto, 'id'>>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    console.log(`[ACTION LOG] updateProyecto called for proyectoId: ${proyectoId} with data:`, data);
    await delay(150);
    try {
        const index = mockProyectos.findIndex(p => p.id === proyectoId);
        if (index === -1) {
            console.error(`[ACTION LOG] updateProyecto failed: Proyecto con ID ${proyectoId} no encontrado.`);
            return { success: false, message: 'Proyecto no encontrado.' };
        }
        
        const updatedData: any = { ...data };
        if (data.fechaInicio) updatedData.fechaInicio = (data.fechaInicio as Date).toISOString();
        if (data.fechaFin) updatedData.fechaFin = (data.fechaFin as Date).toISOString();

        mockProyectos[index] = { ...mockProyectos[index], ...updatedData };
        console.log('[ACTION LOG] updateProyecto successful.');
        return { success: true, message: 'Proyecto actualizado.', proyecto: parseProyectos([JSON.parse(JSON.stringify(mockProyectos[index]))])[0] };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in updateProyecto for ID ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al actualizar el proyecto.' };
    }
}

export async function saveDailyReport(proyectoId: string, encargadoId: string, trabajadoresReporte: ReporteTrabajador[], comentarios: string, fotosURLs: string[]): Promise<{ success: boolean; message: string }> {
    console.log(`[ACTION LOG] saveDailyReport called for proyectoId: ${proyectoId}`);
    await delay(250);
    try {
        const newReporte: any = {
            id: `rep-mock-${Date.now()}`,
            proyectoId,
            encargadoId,
            fecha: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            trabajadores: trabajadoresReporte,
            comentarios,
            fotosURLs,
            validacion: {
                encargado: { validado: true, timestamp: new Date().toISOString() },
                subcontrata: { validado: false, timestamp: null },
                constructora: { validado: false, timestamp: null },
            },
        };
        mockReportesDiarios.unshift(newReporte);
        console.log('[ACTION LOG] saveDailyReport successful.');
        return { success: true, message: 'Reporte diario guardado con éxito.' };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in saveDailyReport for proyectoId ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al guardar el reporte.' };
    }
}

export async function updateDailyReport(reporteId: string, trabajadoresReporte: ReporteTrabajador[]): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    console.log(`[ACTION LOG] updateDailyReport called for reporteId: ${reporteId}`);
    await delay(150);
    try {
        const index = mockReportesDiarios.findIndex(r => r.id === reporteId);
        if (index === -1) {
             console.error(`[ACTION LOG] updateDailyReport failed: Reporte con ID ${reporteId} no encontrado.`);
            return { success: false, message: 'Reporte no encontrado.' };
        }
        (mockReportesDiarios as any)[index].trabajadores = trabajadoresReporte;
        (mockReportesDiarios as any)[index].modificacionJefeObra = {
            modificado: true,
            jefeObraId: 'jefe-obra-mock-id',
            timestamp: new Date().toISOString(),
            reporteOriginal: '[]' // Mocked
        };
        console.log('[ACTION LOG] updateDailyReport successful.');
        return { success: true, message: 'Reporte actualizado.', reporte: parseReportes([JSON.parse(JSON.stringify(mockReportesDiarios[index]))])[0] };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in updateDailyReport for ID ${reporteId}:`, e);
        return { success: false, message: e.message || 'Error al actualizar el reporte.' };
    }
}

export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
    console.log('[ACTION LOG] saveFichaje called with data:', data);
    await delay(100);
    try {
        const newFichaje = { id: `fichaje-mock-${Date.now()}`, ...data, timestamp: new Date().toISOString() };
        mockFichajes.push(newFichaje);
        console.log('[ACTION LOG] saveFichaje successful.');
        return { success: true, message: `Fichaje de ${data.tipo} guardado.` };
    } catch (e: any) {
        console.error('[ACTION LOG] Error in saveFichaje:', e);
        return { success: false, message: e.message || 'Error al guardar el fichaje.' };
    }
}

export async function addTrabajador(data: { subcontrataId: string, nombre: string, categoriaProfesional: Trabajador['categoriaProfesional'], codigoAcceso: string }): Promise<{ success: boolean, message: string, trabajador?: Trabajador }> {
    console.log('[ACTION LOG] addTrabajador called with data:', data);
    await delay(150);
    try {
        const newTrabajador: Trabajador = {
            id: `trab-mock-${Date.now()}`,
            proyectosAsignados: [],
            ...data,
        };
        mockTrabajadores.push(newTrabajador);
        console.log('[ACTION LOG] addTrabajador successful.');
        return { success: true, message: "Trabajador añadido.", trabajador: JSON.parse(JSON.stringify(newTrabajador)) };
    } catch (e: any) {
        console.error('[ACTION LOG] Error in addTrabajador:', e);
        return { success: false, message: e.message || 'Error al añadir trabajador.' };
    }
}

export async function removeTrabajador(trabajadorId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION LOG] removeTrabajador called for trabajadorId: ${trabajadorId}`);
    await delay(150);
    try {
        const index = mockTrabajadores.findIndex(t => t.id === trabajadorId);
        if (index === -1) {
            console.error(`[ACTION LOG] removeTrabajador failed: Trabajador con ID ${trabajadorId} no encontrado.`);
            return { success: false, message: "Trabajador no encontrado." };
        }
        mockTrabajadores.splice(index, 1);
        console.log('[ACTION LOG] removeTrabajador successful.');
        return { success: true, message: "Trabajador eliminado." };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in removeTrabajador for ID ${trabajadorId}:`, e);
        return { success: false, message: e.message || 'Error al eliminar trabajador.' };
    }
}

export async function addMaquinaria(data: { subcontrataId: string, nombre: string, matriculaORef: string }): Promise<{ success: boolean, message: string, maquinaria?: Maquinaria }> {
    console.log('[ACTION LOG] addMaquinaria called with data:', data);
    await delay(150);
    try {
        const newMaquinaria: Maquinaria = {
            id: `maq-mock-${Date.now()}`,
            proyectosAsignados: [],
            ...data,
        };
        mockMaquinaria.push(newMaquinaria);
        console.log('[ACTION LOG] addMaquinaria successful.');
        return { success: true, message: "Maquinaria añadida.", maquinaria: JSON.parse(JSON.stringify(newMaquinaria)) };
    } catch (e: any) {
        console.error('[ACTION LOG] Error in addMaquinaria:', e);
        return { success: false, message: e.message || 'Error al añadir maquinaria.' };
    }
}

export async function removeMaquinaria(maquinariaId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION LOG] removeMaquinaria called for maquinariaId: ${maquinariaId}`);
    await delay(150);
    try {
        const index = mockMaquinaria.findIndex(m => m.id === maquinariaId);
        if (index === -1) {
             console.error(`[ACTION LOG] removeMaquinaria failed: Maquinaria con ID ${maquinariaId} no encontrada.`);
            return { success: false, message: "Maquinaria no encontrada." };
        }
        mockMaquinaria.splice(index, 1);
        console.log('[ACTION LOG] removeMaquinaria successful.');
        return { success: true, message: "Maquinaria eliminada." };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in removeMaquinaria for ID ${maquinariaId}:`, e);
        return { success: false, message: e.message || 'Error al eliminar maquinaria.' };
    }
}

export async function assignTrabajadoresToProyecto(proyectoId: string, trabajadorIds: string[]): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION LOG] assignTrabajadoresToProyecto called for proyectoId: ${proyectoId} with trabajadorIds:`, trabajadorIds);
    await delay(200);
    try {
        trabajadorIds.forEach(id => {
            const trabajador = mockTrabajadores.find(t => t.id === id);
            if (trabajador && !trabajador.proyectosAsignados?.includes(proyectoId)) {
                trabajador.proyectosAsignados?.push(proyectoId);
            }
        });
        console.log('[ACTION LOG] assignTrabajadoresToProyecto successful.');
        return { success: true, message: "Personal asignado." };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in assignTrabajadoresToProyecto for proyectoId ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al asignar personal.' };
    }
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION LOG] removeTrabajadorFromProyecto called for proyectoId: ${proyectoId}, trabajadorId: ${trabajadorId}`);
    await delay(100);
    try {
        const trabajador = mockTrabajadores.find(t => t.id === trabajadorId);
        if (trabajador && trabajador.proyectosAsignados) {
            const index = trabajador.proyectosAsignados.indexOf(proyectoId);
            if (index > -1) {
                trabajador.proyectosAsignados.splice(index, 1);
            }
        }
        console.log('[ACTION LOG] removeTrabajadorFromProyecto successful.');
        return { success: true, message: "Trabajador desvinculado." };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in removeTrabajadorFromProyecto for proyectoId ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al desvincular trabajador.' };
    }
}

export async function assignMaquinariaToProyecto(proyectoId: string, maquinariaIds: string[]): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION LOG] assignMaquinariaToProyecto called for proyectoId: ${proyectoId} with maquinariaIds:`, maquinariaIds);
    await delay(200);
    try {
        maquinariaIds.forEach(id => {
            const maquina = mockMaquinaria.find(m => m.id === id);
            if (maquina && !maquina.proyectosAsignados?.includes(proyectoId)) {
                maquina.proyectosAsignados?.push(proyectoId);
            }
        });
        console.log('[ACTION LOG] assignMaquinariaToProyecto successful.');
        return { success: true, message: "Maquinaria asignada." };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in assignMaquinariaToProyecto for proyectoId ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al asignar maquinaria.' };
    }
}

export async function removeMaquinariaFromProyecto(proyectoId: string, maquinariaId: string): Promise<{ success: boolean, message: string }> {
    console.log(`[ACTION LOG] removeMaquinariaFromProyecto called for proyectoId: ${proyectoId}, maquinariaId: ${maquinariaId}`);
    await delay(100);
    try {
        const maquina = mockMaquinaria.find(m => m.id === maquinariaId);
        if (maquina && maquina.proyectosAsignados) {
            const index = maquina.proyectosAsignados.indexOf(proyectoId);
            if (index > -1) {
                maquina.proyectosAsignados.splice(index, 1);
            }
        }
        console.log('[ACTION LOG] removeMaquinariaFromProyecto successful.');
        return { success: true, message: "Maquinaria desvinculada." };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in removeMaquinariaFromProyecto for proyectoId ${proyectoId}:`, e);
        return { success: false, message: e.message || 'Error al desvincular maquinaria.' };
    }
}

export async function validateDailyReport(reporteId: string, role: 'subcontrata' | 'constructora'): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    console.log(`[ACTION LOG] validateDailyReport called for reporteId: ${reporteId} by role: ${role}`);
    await delay(150);
    try {
        const index = mockReportesDiarios.findIndex(r => r.id === reporteId);
        if (index === -1) {
            console.error(`[ACTION LOG] validateDailyReport failed: Reporte con ID ${reporteId} no encontrado.`);
            return { success: false, message: 'Reporte no encontrado.' };
        }
        const reporte = (mockReportesDiarios as any)[index];
        if (role === 'subcontrata') {
            reporte.validacion.subcontrata = { validado: true, timestamp: new Date().toISOString() };
        } else if (role === 'constructora') {
            reporte.validacion.constructora = { validado: true, timestamp: new Date().toISOString() };
        }
        console.log('[ACTION LOG] validateDailyReport successful.');
        return { success: true, message: `Reporte validado por ${role}.`, reporte: parseReportes([JSON.parse(JSON.stringify(reporte))])[0] };
    } catch (e: any) {
        console.error(`[ACTION LOG] Error in validateDailyReport for ID ${reporteId}:`, e);
        return { success: false, message: e.message || 'Error al validar el reporte.' };
    }
}
