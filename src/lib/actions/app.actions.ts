
// src/lib/actions/app.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp, writeBatch, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora, Maquinaria } from '../types';
import { revalidatePath } from 'next/cache';

// Helper to convert a Firestore doc to a plain JS object, converting Timestamps to Dates
const docToObject = (doc: any) => {
    if (!doc.exists()) return null;
    const data = doc.data();
    if (!data) return null; // Defensive check
    // Recursively convert timestamps
    const convertTimestamps = (obj: any): any => {
        if (obj instanceof Timestamp) {
            return obj.toDate();
        }
        if (Array.isArray(obj)) {
            return obj.map(convertTimestamps);
        }
        if (obj !== null && typeof obj === 'object') {
            const newObj: { [key: string]: any } = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = convertTimestamps(obj[key]);
                }
            }
            return newObj;
        }
        return obj;
    };
    const convertedData = convertTimestamps(data);
    return { ...convertedData, id: doc.id };
};

// --- DATA FETCHING ---

export async function getConstructoras(): Promise<Constructora[]> {
    try {
        const snapshot = await getDocs(collection(db, "constructoras"));
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Constructora[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getConstructoras: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
    try {
        const snapshot = await getDocs(collection(db, "subcontratas"));
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Subcontrata[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getSubcontratas: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
    try {
        const q = query(collection(db, "proyectos"), where("constructoraId", "==", constructoraId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Proyecto[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getProyectosByConstructora for ${constructoraId}: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
    try {
        const q = query(collection(db, "proyectos"), where("subcontrataId", "==", subcontrataId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Proyecto[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getProyectosBySubcontrata for ${subcontrataId}: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getProyectoById(proyectoId: string): Promise<Proyecto | null> {
    try {
        const docRef = doc(db, "proyectos", proyectoId);
        const docSnap = await getDoc(docRef);
        return docToObject(docSnap) as Proyecto | null;
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getProyectoById for ${proyectoId}: ${e.message}`, { code: e.code });
        return null;
    }
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    try {
        const q = query(collection(db, "trabajadores"), where("proyectosAsignados", "array-contains", proyectoId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Trabajador[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getTrabajadoresByProyecto for ${proyectoId}: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getMaquinariaByProyecto(proyectoId: string): Promise<Maquinaria[]> {
    try {
        const q = query(collection(db, "maquinaria"), where("proyectosAsignados", "array-contains", proyectoId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Maquinaria[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getMaquinariaByProyecto for ${proyectoId}: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
    try {
        let q = query(collection(db, "reportesDiarios"));

        if (proyectoId) {
            q = query(q, where("proyectoId", "==", proyectoId));
        }
        if (encargadoId) {
            q = query(q, where("encargadoId", "==", encargadoId));
        }

        const snapshot = await getDocs(q);
        let reportes = snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as ReporteDiario[];

        if (subcontrataId) {
            const proyectosSnapshot = await getDocs(query(collection(db, "proyectos"), where("subcontrataId", "==", subcontrataId)));
            const proyectosDeSubIds = new Set(proyectosSnapshot.docs.map(p => p.id));
            reportes = reportes.filter(r => proyectosDeSubIds.has(r.proyectoId));
        }

        return reportes;
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getReportesDiarios: ${e.message}`, { code: e.code });
        return [];
    }
}


export async function getReporteDiarioById(reporteId: string): Promise<ReporteDiario | null> {
    try {
        const docRef = doc(db, "reportesDiarios", reporteId);
        const docSnap = await getDoc(docRef);
        return docToObject(docSnap) as ReporteDiario | null;
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getReporteDiarioById for ${reporteId}: ${e.message}`, { code: e.code });
        return null;
    }
}

export async function getTrabajadoresBySubcontrata(subcontrataId: string): Promise<Trabajador[]> {
    try {
        const q = query(collection(db, "trabajadores"), where("subcontrataId", "==", subcontrataId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Trabajador[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getTrabajadoresBySubcontrata for ${subcontrataId}: ${e.message}`, { code: e.code });
        return [];
    }
}

export async function getMaquinariaBySubcontrata(subcontrataId: string): Promise<Maquinaria[]> {
    try {
        const q = query(collection(db, "maquinaria"), where("subcontrataId", "==", subcontrataId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => docToObject(doc)).filter(Boolean) as Maquinaria[];
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] getMaquinariaBySubcontrata for ${subcontrataId}: ${e.message}`, { code: e.code });
        return [];
    }
}


// --- DATA MUTATION ---

const dataToFirestore = (data: any) => {
    const firestoreData: {[key: string]: any} = {};
    for (const key in data) {
        if (data[key] instanceof Date) {
            firestoreData[key] = Timestamp.fromDate(data[key]);
        } else {
            firestoreData[key] = data[key];
        }
    }
    delete firestoreData.id;
    return firestoreData;
};

// OPTIMIZED to remove unnecessary read-after-write
export async function addProyecto(data: Omit<Proyecto, 'id'>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    try {
        const dataToSave = { ...dataToFirestore(data), createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, "proyectos"), dataToSave);
        
        const newProyecto: Proyecto = {
            id: docRef.id,
            ...data
        };

        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Proyecto añadido con éxito.", proyecto: newProyecto };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] addProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al añadir el proyecto: ${e.message}` };
    }
}

export async function updateProyecto(proyectoId: string, data: Partial<Omit<Proyecto, 'id'>>): Promise<{ success: boolean; message: string; proyecto?: Proyecto }> {
    try {
        const docRef = doc(db, "proyectos", proyectoId);
        await updateDoc(docRef, { ...dataToFirestore(data), updatedAt: serverTimestamp() });
        const updatedProyecto = await getProyectoById(proyectoId);
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Proyecto actualizado con éxito.", proyecto: updatedProyecto! };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] updateProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al actualizar el proyecto: ${e.message}` };
    }
}

export async function saveDailyReport(proyectoId: string, encargadoId: string, trabajadoresReporte: ReporteTrabajador[], comentarios: string): Promise<{ success: boolean; message: string }> {
    try {
        const reporte: Omit<ReporteDiario, 'id' | 'timestamp'> = {
            proyectoId,
            encargadoId,
            trabajadores: trabajadoresReporte,
            comentarios,
            fecha: new Date(),
            validacion: {
                encargado: { validado: true, timestamp: new Date() },
                subcontrata: { validado: false, timestamp: null },
                constructora: { validado: false, timestamp: null },
            },
        };
        await addDoc(collection(db, "reportesDiarios"), { ...dataToFirestore(reporte), timestamp: serverTimestamp() });
        revalidatePath('/(app)', 'layout');
        return { success: true, message: 'Reporte diario guardado con éxito.' };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] saveDailyReport: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al guardar el reporte: ${e.message}` };
    }
}

export async function updateDailyReport(reporteId: string, trabajadoresReporte: ReporteTrabajador[]): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    try {
        const docRef = doc(db, "reportesDiarios", reporteId);
        const originalReporte = await getReporteDiarioById(reporteId);
        if (!originalReporte) {
            return { success: false, message: 'Reporte no encontrado para actualizar.' };
        }
        await updateDoc(docRef, { 
            trabajadores: trabajadoresReporte,
            modificacionJefeObra: {
                modificado: true,
                jefeObraId: 'jefe-obra-mock-id',
                timestamp: new Date(),
                reporteOriginal: JSON.stringify(originalReporte.trabajadores),
            },
            updatedAt: serverTimestamp()
         });
        const updatedReporte = await getReporteDiarioById(reporteId);
        revalidatePath('/(app)', 'layout');
        return { success: true, message: 'Reporte actualizado con éxito.', reporte: updatedReporte! };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] updateDailyReport: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al actualizar el reporte: ${e.message}` };
    }
}

export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
    try {
        await addDoc(collection(db, "fichajes"), { ...data, timestamp: serverTimestamp() });
        revalidatePath('/(app)', 'layout');
        return { success: true, message: `Fichaje de ${data.tipo} guardado con éxito.` };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] saveFichaje: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al guardar el fichaje: ${e.message}` };
    }
}

// OPTIMIZED to remove unnecessary read-after-write
export async function addTrabajador(data: { subcontrataId: string, nombre: string, categoriaProfesional: Trabajador['categoriaProfesional'], codigoAcceso: string }): Promise<{ success: boolean, message: string, trabajador?: Trabajador }> {
    try {
        const dataToSave = { ...data, proyectosAsignados: [], createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, "trabajadores"), dataToSave);
        
        const newTrabajador: Trabajador = {
            id: docRef.id,
            subcontrataId: data.subcontrataId,
            nombre: data.nombre,
            categoriaProfesional: data.categoriaProfesional,
            codigoAcceso: data.codigoAcceso,
            proyectosAsignados: [],
        };

        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Trabajador añadido.", trabajador: newTrabajador };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] addTrabajador: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al añadir trabajador: ${e.message}` };
    }
}


export async function removeTrabajador(trabajadorId: string): Promise<{ success: boolean, message: string }> {
    try {
        await deleteDoc(doc(db, "trabajadores", trabajadorId));
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Trabajador eliminado." };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] removeTrabajador: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al eliminar trabajador: ${e.message}` };
    }
}

// OPTIMIZED to remove unnecessary read-after-write
export async function addMaquinaria(data: { subcontrataId: string, nombre: string, matriculaORef: string }): Promise<{ success: boolean, message: string, maquinaria?: Maquinaria }> {
    try {
        const dataToSave = { ...data, proyectosAsignados: [], createdAt: serverTimestamp() };
        const docRef = await addDoc(collection(db, "maquinaria"), dataToSave);
        
        const newMaquinaria: Maquinaria = {
            id: docRef.id,
            subcontrataId: data.subcontrataId,
            nombre: data.nombre,
            matriculaORef: data.matriculaORef,
            proyectosAsignados: [],
        };
        
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Maquinaria añadida.", maquinaria: newMaquinaria };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] addMaquinaria: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al añadir maquinaria: ${e.message}` };
    }
}


export async function removeMaquinaria(maquinariaId: string): Promise<{ success: boolean, message: string }> {
    try {
        await deleteDoc(doc(db, "maquinaria", maquinariaId));
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Maquinaria eliminada." };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] removeMaquinaria: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al eliminar maquinaria: ${e.message}` };
    }
}

export async function assignTrabajadoresToProyecto(proyectoId: string, trabajadorIds: string[]): Promise<{ success: boolean, message: string }> {
    try {
        const batch = writeBatch(db);
        trabajadorIds.forEach(id => {
            const docRef = doc(db, "trabajadores", id);
            batch.update(docRef, { proyectosAsignados: arrayUnion(proyectoId) });
        });
        await batch.commit();
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Personal asignado." };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] assignTrabajadoresToProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al asignar personal: ${e.message}` };
    }
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{ success: boolean, message: string }> {
    try {
        const docRef = doc(db, "trabajadores", trabajadorId);
        await updateDoc(docRef, { proyectosAsignados: arrayRemove(proyectoId) });
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Trabajador desvinculado." };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] removeTrabajadorFromProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al desvincular trabajador: ${e.message}` };
    }
}

export async function assignMaquinariaToProyecto(proyectoId: string, maquinariaIds: string[]): Promise<{ success: boolean, message: string }> {
    try {
        const batch = writeBatch(db);
        maquinariaIds.forEach(id => {
            const docRef = doc(db, "maquinaria", id);
            batch.update(docRef, { proyectosAsignados: arrayUnion(proyectoId) });
        });
        await batch.commit();
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Maquinaria asignada." };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] assignMaquinariaToProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al asignar maquinaria: ${e.message}` };
    }
}

export async function removeMaquinariaFromProyecto(proyectoId: string, maquinariaId: string): Promise<{ success: boolean, message: string }> {
    try {
        const docRef = doc(db, "maquinaria", maquinariaId);
        await updateDoc(docRef, { proyectosAsignados: arrayRemove(proyectoId) });
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Maquinaria desvinculada." };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] removeMaquinariaFromProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al desvincular maquinaria: ${e.message}` };
    }
}

export async function validateDailyReport(reporteId: string, role: 'subcontrata' | 'constructora'): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
    try {
        const docRef = doc(db, "reportesDiarios", reporteId);
        const originalReporte = await getReporteDiarioById(reporteId);
        if (!originalReporte) {
            return { success: false, message: 'Reporte no encontrado.' };
        }

        const updateData: any = { updatedAt: serverTimestamp() };
        if (role === 'subcontrata') {
            if (!originalReporte.validacion.encargado.validado) {
                return { success: false, message: 'El reporte debe ser validado primero por el Encargado.' };
            }
            updateData['validacion.subcontrata'] = { validado: true, timestamp: new Date() };
        } else if (role === 'constructora') {
            if (!originalReporte.validacion.subcontrata.validado) {
                return { success: false, message: 'El reporte debe ser validado primero por la Subcontrata.' };
            }
            updateData['validacion.constructora'] = { validado: true, timestamp: new Date() };
        }
        
        await updateDoc(docRef, dataToFirestore(updateData));
        const updatedReporte = await getReporteDiarioById(reporteId);
        revalidatePath('/(app)', 'layout');
        return { success: true, message: `Reporte validado por ${role} con éxito.`, reporte: updatedReporte! };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] validateDailyReport: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al validar el reporte: ${e.message}` };
    }
}

// Keep this action for seeding demo data, as it's separate from live app logic
export async function addTrabajadorToProyecto(proyectoId: string, subcontrataId: string, nombre: string, codigoAcceso: string, categoriaProfesional: Trabajador['categoriaProfesional']): Promise<{success: boolean, message: string, trabajador?: Trabajador}> {
    try {
        const data = { subcontrataId, nombre, categoriaProfesional, codigoAcceso, proyectosAsignados: [proyectoId] };
        const docRef = await addDoc(collection(db, "trabajadores"), { ...data, createdAt: serverTimestamp() });
        const snapshot = await getDoc(docRef);
        revalidatePath('/(app)', 'layout');
        return { success: true, message: "Nuevo trabajador creado y asignado.", trabajador: docToObject(snapshot) as Trabajador };
    } catch (e: any) {
        console.error(`[ACTIONS_ERROR] addTrabajadorToProyecto: ${e.message}`, { code: e.code });
        return { success: false, message: `Error al crear y asignar trabajador: ${e.message}` };
    }
}
