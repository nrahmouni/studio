
// src/lib/actions/app.actions.ts
'use server';

import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora, Maquinaria } from '../types';
import { 
    mockConstructoras, mockSubcontratas, mockProyectos, mockTrabajadores, mockMaquinaria, mockReportesDiarios, mockFichajes,
    saveDataToFile
} from '../mockData';
import { parseISO } from 'date-fns';

// Helper para simular latencia de red
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const parseProyectos = (proyectos: any[]): Proyecto[] => {
    return proyectos.map(p => ({
        ...p,
        // fechaInicio and fechaFin can be null, so check before parsing
        fechaInicio: p.fechaInicio ? parseISO(p.fechaInicio) : null,
        fechaFin: p.fechaFin ? parseISO(p.fechaFin) : null,
    }));
}

const parseReportes = (reportes: any[]): ReporteDiario[] => {
    return reportes.map(r => ({
        ...r,
        fecha: parseISO(r.fecha),
        timestamp: parseISO(r.timestamp),
        validacion: {
            encargado: {
                validado: r.validacion.encargado.validado,
                timestamp: r.validacion.encargado.timestamp ? parseISO(r.validacion.encargado.timestamp) : null,
            },
            subcontrata: {
                validado: r.validacion.subcontrata.validado,
                timestamp: r.validacion.subcontrata.timestamp ? parseISO(r.validacion.subcontrata.timestamp) : null,
            },
            constructora: {
                validado: r.validacion.constructora.validado,
                timestamp: r.validacion.constructora.timestamp ? parseISO(r.validacion.constructora.timestamp) : null,
            },
        },
        modificacionJefeObra: r.modificacionJefeObra ? {
            ...r.modificacionJefeObra,
            timestamp: r.modificacionJefeObra.timestamp ? parseISO(r.modificacionJefeObra.timestamp) : null,
        } : undefined,
    }));
}


// --- DATA FETCHING ---

export async function getConstructoras(): Promise<Constructora[]> {
    await delay(50);
    return JSON.parse(JSON.stringify(mockConstructoras));
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
    await delay(50);
    return JSON.parse(JSON.stringify(mockSubcontratas));
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
    await delay(100);
    const proyectos = mockProyectos.filter(p => p.constructoraId === constructoraId);
    return parseProyectos(JSON.parse(JSON.stringify(proyectos)));
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
    await delay(100);
    const proyectos = mockProyectos.filter(p => p.subcontrataId === subcontrataId);
    return parseProyectos(JSON.parse(JSON.stringify(proyectos)));
}

export async function getProyectoById(proyectoId: string): Promise<Proyecto | null> {
    await delay(50);
    const proyecto = mockProyectos.find(p => p.id === proyectoId) || null;
    return proyecto ? parseProyectos([JSON.parse(JSON.stringify(proyecto))])[0] : null;
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(mockTrabajadores.filter(t => t.proyectosAsignados?.includes(proyectoId))));
}

export async function getMaquinariaByProyecto(proyectoId: string): Promise<Maquinaria[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(mockMaquinaria.filter(m => m.proyectosAsignados?.includes(proyectoId))));
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
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
    return parseReportes(JSON.parse(JSON.stringify(reportes)));
}

export async function getReportesDiariosByConstructora(constructoraId: string): Promise<ReporteDiario[]> {
    await delay(150);
    let reportes = [...mockReportesDiarios];
    
    const proyectosDeConstructora = mockProyectos.filter(p => p.constructoraId === constructoraId).map(p => p.id);
    reportes = reportes.filter((r: any) => proyectosDeConstructora.includes(r.proyectoId));

    return parseReportes(JSON.parse(JSON.stringify(reportes)));
}

export async function getReporteDiarioById(reporteId: string): Promise<ReporteDiario | null> {
    await delay(50);
    const reporte = mockReportesDiarios.find(r => r.id === reporteId) || null;
    return reporte ? parseReportes([JSON.parse(JSON.stringify(reporte))])[0] : null;
}

export async function getTrabajadoresBySubcontrata(subcontrataId: string): Promise<Trabajador[]> {
    await delay(100);
    return JSON.parse(JSON.stringify(mockTrabajadores.filter(t => t.subcontrataId === subcontrataId)));
}

export async function getMaquinariaBySubcontrata(subcontrataId: string): Promise<Maquinaria[]> {
     await delay(100);
    return JSON.parse(JSON.stringify(mockMaquinaria.filter(m => m.subcontrataId === subcontrataId)));
}

// --- DATA MUTATION ---

export async function addEmpresa(data: { empresaNombre: string }): Promise<{ success: boolean; message: string; empresa?: Constructora }> {
    await delay(200);
    try {
        const newEmpresa: Constructora = {
            id: `const-mock-${Date.now()}`,
            nombre: data.empresaNombre,
        };
        mockConstructoras.unshift(newEmpresa);
        // await saveDataToFile('constructoras', mockConstructoras); // This call is removed
        return { success: true, message: 'Empresa añadida con éxito.', empresa: JSON.parse(JSON.stringify(newEmpresa)) };
    } catch(e: any) {
        console.error("Error en addEmpresa:", e);
        return { success: false, message: e.message || 'Error al añadir empresa.' };
    }
}


export async function addProyecto(data: Omit<Proyecto, 'id'>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    await delay(200);
    try {
        const newProyecto: Proyecto = {
            id: `proy-mock-${Date.now()}`,
            ...data,
        };
        mockProyectos.unshift(newProyecto as any); // Type assertion to bypass string/date mismatch temporarily
        await saveDataToFile('proyectos', mockProyectos);
        return { success: true, message: 'Proyecto añadido con éxito.', proyecto: parseProyectos([JSON.parse(JSON.stringify(newProyecto))])[0] };
    } catch(e: any) {
        return { success: false, message: e.message || 'Error al añadir proyecto.' };
    }
}

export async function updateProyecto(proyectoId: string, data: Partial<Omit<Proyecto, 'id'>>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    await delay(150);
    try {
        const index = mockProyectos.findIndex(p => p.id === proyectoId);
        if (index === -1) {
            return { success: false, message: 'Proyecto no encontrado.' };
        }
        mockProyectos[index] = { ...mockProyectos[index], ...data } as any; // Temp assertion
        await saveDataToFile('proyectos', mockProyectos);
        return { success: true, message: 'Proyecto actualizado.', proyecto: parseProyectos([JSON.parse(JSON.stringify(mockProyectos[index]))])[0] };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al actualizar el proyecto.' };
    }
}

export async function saveDailyReport(proyectoId: string, encargadoId: string, trabajadoresReporte: ReporteTrabajador[], comentarios: string, fotosURLs: string[]): Promise<{ success: boolean; message: string }> {
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
        await saveDataToFile('reportesDiarios', mockReportesDiarios);
        return { success: true, message: 'Reporte diario guardado con éxito.' };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al guardar el reporte.' };
    }
}

export async function updateDailyReport(reporteId: string, trabajadoresReporte: ReporteTrabajador[]): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    await delay(150);
    try {
        const index = mockReportesDiarios.findIndex(r => r.id === reporteId);
        if (index === -1) {
            return { success: false, message: 'Reporte no encontrado.' };
        }
        (mockReportesDiarios as any)[index].trabajadores = trabajadoresReporte;
        (mockReportesDiarios as any)[index].modificacionJefeObra = {
            modificado: true,
            jefeObraId: 'jefe-obra-mock-id',
            timestamp: new Date().toISOString(),
            reporteOriginal: '[]' // Mocked
        };
        await saveDataToFile('reportesDiarios', mockReportesDiarios);
        return { success: true, message: 'Reporte actualizado.', reporte: parseReportes([JSON.parse(JSON.stringify(mockReportesDiarios[index]))])[0] };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al actualizar el reporte.' };
    }
}

export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
    await delay(100);
    try {
        const newFichaje = { id: `fichaje-mock-${Date.now()}`, ...data, timestamp: new Date().toISOString() };
        mockFichajes.push(newFichaje);
        await saveDataToFile('fichajes', mockFichajes);
        return { success: true, message: `Fichaje de ${data.tipo} guardado.` };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al guardar el fichaje.' };
    }
}

export async function addTrabajador(data: { subcontrataId: string, nombre: string, categoriaProfesional: Trabajador['categoriaProfesional'], codigoAcceso: string }): Promise<{ success: boolean, message: string, trabajador?: Trabajador }> {
    await delay(150);
    try {
        const newTrabajador: Trabajador = {
            id: `trab-mock-${Date.now()}`,
            proyectosAsignados: [],
            ...data,
        };
        mockTrabajadores.push(newTrabajador);
        await saveDataToFile('trabajadores', mockTrabajadores);
        return { success: true, message: "Trabajador añadido.", trabajador: JSON.parse(JSON.stringify(newTrabajador)) };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al añadir trabajador.' };
    }
}

export async function removeTrabajador(trabajadorId: string): Promise<{ success: boolean, message: string }> {
    await delay(150);
    try {
        const index = mockTrabajadores.findIndex(t => t.id === trabajadorId);
        if (index === -1) {
            return { success: false, message: "Trabajador no encontrado." };
        }
        mockTrabajadores.splice(index, 1);
        await saveDataToFile('trabajadores', mockTrabajadores);
        return { success: true, message: "Trabajador eliminado." };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al eliminar trabajador.' };
    }
}

export async function addMaquinaria(data: { subcontrataId: string, nombre: string, matriculaORef: string }): Promise<{ success: boolean, message: string, maquinaria?: Maquinaria }> {
    await delay(150);
    try {
        const newMaquinaria: Maquinaria = {
            id: `maq-mock-${Date.now()}`,
            proyectosAsignados: [],
            ...data,
        };
        mockMaquinaria.push(newMaquinaria);
        await saveDataToFile('maquinaria', mockMaquinaria);
        return { success: true, message: "Maquinaria añadida.", maquinaria: JSON.parse(JSON.stringify(newMaquinaria)) };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al añadir maquinaria.' };
    }
}

export async function removeMaquinaria(maquinariaId: string): Promise<{ success: boolean, message: string }> {
    await delay(150);
    try {
        const index = mockMaquinaria.findIndex(m => m.id === maquinariaId);
        if (index === -1) {
            return { success: false, message: "Maquinaria no encontrada." };
        }
        mockMaquinaria.splice(index, 1);
        await saveDataToFile('maquinaria', mockMaquinaria);
        return { success: true, message: "Maquinaria eliminada." };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al eliminar maquinaria.' };
    }
}

export async function assignTrabajadoresToProyecto(proyectoId: string, trabajadorIds: string[]): Promise<{ success: boolean, message: string }> {
    await delay(200);
    try {
        trabajadorIds.forEach(id => {
            const trabajador = mockTrabajadores.find(t => t.id === id);
            if (trabajador && !trabajador.proyectosAsignados?.includes(proyectoId)) {
                trabajador.proyectosAsignados?.push(proyectoId);
            }
        });
        await saveDataToFile('trabajadores', mockTrabajadores);
        return { success: true, message: "Personal asignado." };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al asignar personal.' };
    }
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{ success: boolean, message: string }> {
    await delay(100);
    try {
        const trabajador = mockTrabajadores.find(t => t.id === trabajadorId);
        if (trabajador && trabajador.proyectosAsignados) {
            const index = trabajador.proyectosAsignados.indexOf(proyectoId);
            if (index > -1) {
                trabajador.proyectosAsignados.splice(index, 1);
            }
        }
        await saveDataToFile('trabajadores', mockTrabajadores);
        return { success: true, message: "Trabajador desvinculado." };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al desvincular trabajador.' };
    }
}

export async function assignMaquinariaToProyecto(proyectoId: string, maquinariaIds: string[]): Promise<{ success: boolean, message: string }> {
    await delay(200);
    try {
        maquinariaIds.forEach(id => {
            const maquina = mockMaquinaria.find(m => m.id === id);
            if (maquina && !maquina.proyectosAsignados?.includes(proyectoId)) {
                maquina.proyectosAsignados?.push(proyectoId);
            }
        });
        await saveDataToFile('maquinaria', mockMaquinaria);
        return { success: true, message: "Maquinaria asignada." };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al asignar maquinaria.' };
    }
}

export async function removeMaquinariaFromProyecto(proyectoId: string, maquinariaId: string): Promise<{ success: boolean, message: string }> {
    await delay(100);
    try {
        const maquina = mockMaquinaria.find(m => m.id === maquinariaId);
        if (maquina && maquina.proyectosAsignados) {
            const index = maquina.proyectosAsignados.indexOf(proyectoId);
            if (index > -1) {
                maquina.proyectosAsignados.splice(index, 1);
            }
        }
        await saveDataToFile('maquinaria', mockMaquinaria);
        return { success: true, message: "Maquinaria desvinculada." };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al desvincular maquinaria.' };
    }
}

export async function validateDailyReport(reporteId: string, role: 'subcontrata' | 'constructora'): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    await delay(150);
    try {
        const index = mockReportesDiarios.findIndex(r => r.id === reporteId);
        if (index === -1) {
            return { success: false, message: 'Reporte no encontrado.' };
        }
        const reporte = (mockReportesDiarios as any)[index];
        if (role === 'subcontrata') {
            reporte.validacion.subcontrata = { validado: true, timestamp: new Date().toISOString() };
        } else if (role === 'constructora') {
            reporte.validacion.constructora = { validado: true, timestamp: new Date().toISOString() };
        }
        await saveDataToFile('reportesDiarios', mockReportesDiarios);
        return { success: true, message: `Reporte validado por ${role}.`, reporte: parseReportes([JSON.parse(JSON.stringify(reporte))])[0] };
    } catch (e: any) {
        return { success: false, message: e.message || 'Error al validar el reporte.' };
    }
}

    