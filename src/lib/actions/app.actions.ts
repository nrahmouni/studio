// src/lib/actions/app.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, writeBatch, arrayUnion, arrayRemove, Timestamp, serverTimestamp, setDoc, orderBy } from 'firebase/firestore';
import type { Subcontrata, Proyecto, Trabajador, ReporteTrabajador, ReporteDiario, Constructora } from '../types';
import { v4 as uuidv4 } from 'uuid';

async function getDocsWithParsedDates<T>(querySnapshot: any, dateFields: string[]): Promise<T[]> {
    const results: T[] = [];
    querySnapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        dateFields.forEach(field => {
            if (data[field] instanceof Timestamp) {
                data[field] = data[field].toDate();
            }
        });
        results.push({ id: docSnap.id, ...data } as T);
    });
    return results;
}

// --- Data Fetching ---

export async function getConstructoras(): Promise<Constructora[]> {
  try {
    console.log("ACTION: getConstructoras (Firestore)");
    const q = query(collection(db, "constructoras"), orderBy("nombre"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Constructora));
  } catch (error) {
    console.error("Error in getConstructoras:", error);
    return [];
  }
}

export async function getSubcontratas(): Promise<Subcontrata[]> {
  try {
    console.log("ACTION: getSubcontratas (Firestore)");
    const q = query(collection(db, "subcontratas"), orderBy("nombre"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Subcontrata));
  } catch (error) {
    console.error("Error in getSubcontratas:", error);
    return [];
  }
}

export async function getProyectosByConstructora(constructoraId: string): Promise<Proyecto[]> {
    try {
        console.log(`ACTION: getProyectosByConstructora for ${constructoraId} (Firestore)`);
        const q = query(collection(db, "proyectos"), where("constructoraId", "==", constructoraId), orderBy("nombre"));
        const querySnapshot = await getDocs(q);
        return await getDocsWithParsedDates<Proyecto>(querySnapshot, ['fechaInicio', 'fechaFin']);
    } catch (error) {
        console.error(`Error in getProyectosByConstructora for ${constructoraId}:`, error);
        return [];
    }
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
  try {
    console.log(`ACTION: getProyectosBySubcontrata for ${subcontrataId} (Firestore)`);
    const q = query(collection(db, "proyectos"), where("subcontrataId", "==", subcontrataId), orderBy("nombre"));
    const querySnapshot = await getDocs(q);
    return await getDocsWithParsedDates<Proyecto>(querySnapshot, ['fechaInicio', 'fechaFin']);
  } catch (error) {
    console.error(`Error in getProyectosBySubcontrata for ${subcontrataId}:`, error);
    return [];
  }
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    try {
        console.log(`ACTION: getTrabajadoresByProyecto for ${proyectoId} (Firestore)`);
        const q = query(collection(db, "trabajadores"), where("proyectosAsignados", "array-contains", proyectoId), orderBy("nombre"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trabajador));
    } catch (error) {
        console.error(`Error in getTrabajadoresByProyecto for ${proyectoId}:`, error);
        return [];
    }
}

export async function getReportesDiarios(proyectoId?: string, encargadoId?: string, subcontrataId?: string): Promise<ReporteDiario[]> {
    try {
        console.log(`ACTION: getReportesDiarios (Firestore) for proyectoId: ${proyectoId}, encargadoId: ${encargadoId}, subcontrataId: ${subcontrataId}`);
        let reportesQuery = query(collection(db, "reportesDiarios"), orderBy("fecha", "desc"));

        if (proyectoId) {
            reportesQuery = query(reportesQuery, where("proyectoId", "==", proyectoId));
        }
        if (encargadoId) {
            reportesQuery = query(reportesQuery, where("encargadoId", "==", encargadoId));
        }
        
        const querySnapshot = await getDocs(reportesQuery);
        let reportes = await getDocsWithParsedDates<ReporteDiario>(querySnapshot, ['fecha', 'timestamp', 'validacion.encargado.timestamp', 'validacion.subcontrata.timestamp', 'validacion.constructora.timestamp']);

        if (subcontrataId) {
            const proyectosDeSubQuery = query(collection(db, "proyectos"), where("subcontrataId", "==", subcontrataId));
            const proyectosSnapshot = await getDocs(proyectosDeSubQuery);
            const proyectosDeSubIds = proyectosSnapshot.docs.map(doc => doc.id);
            reportes = reportes.filter(r => proyectosDeSubIds.includes(r.proyectoId));
        }

        return reportes;
    } catch (error) {
        console.error("Error in getReportesDiarios:", error);
        return [];
    }
}


export async function getReporteDiarioById(reporteId: string): Promise<ReporteDiario | null> {
    try {
        console.log(`ACTION: getReporteDiarioById for ${reporteId} (Firestore)`);
        const docRef = doc(db, "reportesDiarios", reporteId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const dateFields = ['fecha', 'timestamp', 'validacion.encargado.timestamp', 'validacion.subcontrata.timestamp', 'validacion.constructora.timestamp'];
            dateFields.forEach(field => {
                const keys = field.split('.');
                let current: any = data;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (current[keys[i]]) current = current[keys[i]];
                    else return;
                }
                const finalKey = keys[keys.length - 1];
                if (current && current[finalKey] instanceof Timestamp) {
                    current[finalKey] = current[finalKey].toDate();
                }
            });
            return { id: docSnap.id, ...data } as ReporteDiario;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error in getReporteDiarioById for ${reporteId}:`, error);
        return null;
    }
}

// --- Data Mutation ---

export async function saveDailyReport(
  proyectoId: string,
  encargadoId: string,
  trabajadoresReporte: ReporteTrabajador[]
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("ACTION: saveDailyReport (Firestore)");
    const newReportId = `rep-${uuidv4()}`;
    const newReportRef = doc(db, "reportesDiarios", newReportId);

    const newReport: Omit<ReporteDiario, 'id'> = {
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

    await setDoc(newReportRef, newReport);
    return { success: true, message: 'Reporte diario guardado en Firestore con éxito.' };
  } catch(error: any) {
    console.error("Error in saveDailyReport:", error);
    return { success: false, message: `Error al guardar el reporte: ${error.message}` };
  }
}

export async function updateDailyReport(
  reporteId: string,
  trabajadoresReporte: ReporteTrabajador[]
): Promise<{ success: boolean; message: string, reporte?: ReporteDiario }> {
  try {
    console.log(`ACTION: updateDailyReport for ${reporteId} (Firestore)`);
    const reportRef = doc(db, "reportesDiarios", reporteId);
    const reportSnap = await getDoc(reportRef);

    if (!reportSnap.exists()) {
      return { success: false, message: 'Reporte no encontrado para actualizar.' };
    }

    const originalReporte = reportSnap.data() as ReporteDiario;
    if (originalReporte.validacion.subcontrata.validado || originalReporte.validacion.constructora.validado) {
      return { success: false, message: 'No se puede modificar un reporte que ya ha sido validado por la subcontrata o constructora.' };
    }

    await updateDoc(reportRef, {
        trabajadores: trabajadoresReporte,
        timestamp: serverTimestamp()
    });

    const updatedReporte = await getReporteDiarioById(reporteId);
    return { success: true, message: 'Reporte actualizado con éxito.', reporte: updatedReporte || undefined };
  } catch(error: any) {
    console.error(`Error in updateDailyReport for ${reporteId}:`, error);
    return { success: false, message: `Error al actualizar el reporte: ${error.message}` };
  }
}


export async function saveFichaje(data: { trabajadorId: string; tipo: 'inicio' | 'fin' }): Promise<{ success: boolean; message: string }> {
  try {
    console.log("ACTION: saveFichaje (Firestore)");
    const newFichajeId = `fich-${uuidv4()}`;
    const newFichajeRef = doc(db, "fichajes", newFichajeId);

    await setDoc(newFichajeRef, {
      trabajadorId: data.trabajadorId,
      tipo: data.tipo,
      timestamp: serverTimestamp()
    });
    
    return { success: true, message: `Fichaje de ${data.tipo} guardado en Firestore con éxito.` };
  } catch(error: any) {
    console.error("Error in saveFichaje:", error);
    return { success: false, message: `Error al guardar el fichaje: ${error.message}` };
  }
}

export async function addTrabajadorToProyecto(proyectoId: string, subcontrataId: string, nombre: string, codigoAcceso: string): Promise<{success: boolean, message: string, trabajador?: Trabajador}> {
    try {
        console.log(`ACTION: addTrabajadorToProyecto (Firestore)`);
        const trabajadoresRef = collection(db, "trabajadores");
        const q = query(trabajadoresRef, where("codigoAcceso", "==", codigoAcceso), where("subcontrataId", "==", subcontrataId));
        const querySnapshot = await getDocs(q);

        if(!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            await updateDoc(existingDoc.ref, {
                proyectosAsignados: arrayUnion(proyectoId)
            });
            const updatedTrabajador = (await getDoc(existingDoc.ref)).data() as Trabajador;
            return { success: true, message: "Trabajador existente añadido al proyecto.", trabajador: {id: existingDoc.id, ...updatedTrabajador} };
        }

        const newTrabajadorId = `trab-${uuidv4()}`;
        const newTrabajadorRef = doc(db, "trabajadores", newTrabajadorId);
        const newTrabajador: Omit<Trabajador, 'id'> = {
            nombre,
            subcontrataId,
            codigoAcceso,
            proyectosAsignados: [proyectoId]
        };
        await setDoc(newTrabajadorRef, newTrabajador);

        return { success: true, message: "Nuevo trabajador creado y asignado.", trabajador: {id: newTrabajadorId, ...newTrabajador} };
    } catch(error: any) {
        console.error("Error in addTrabajadorToProyecto:", error);
        return { success: false, message: `Error al añadir trabajador: ${error.message}` };
    }
}

export async function removeTrabajadorFromProyecto(proyectoId: string, trabajadorId: string): Promise<{success: boolean, message: string}> {
    try {
        console.log(`ACTION: removeTrabajadorFromProyecto (Firestore)`);
        const trabajadorRef = doc(db, "trabajadores", trabajadorId);
        await updateDoc(trabajadorRef, {
            proyectosAsignados: arrayRemove(proyectoId)
        });
        return { success: true, message: "Trabajador eliminado del proyecto." };
    } catch(error: any) {
        console.error("Error in removeTrabajadorFromProyecto:", error);
        return { success: false, message: `Error al eliminar trabajador del proyecto: ${error.message}` };
    }
}

export async function validateDailyReport(
  reporteId: string,
  role: 'subcontrata' | 'constructora'
): Promise<{ success: boolean; message: string; reporte?: ReporteDiario }> {
  try {
    console.log(`ACTION: validateDailyReport for ${reporteId} by ${role} (Firestore)`);
    const reporteRef = doc(db, "reportesDiarios", reporteId);
    const reporteSnap = await getDoc(reporteRef);

    if (!reporteSnap.exists()) {
      return { success: false, message: 'Reporte no encontrado.' };
    }
    
    const reporte = reporteSnap.data() as ReporteDiario;
    const updateData: any = {};

    if (role === 'subcontrata') {
      if (!reporte.validacion.encargado.validado) {
          return { success: false, message: 'El reporte debe ser validado primero por el Encargado.' };
      }
      updateData['validacion.subcontrata'] = { validado: true, timestamp: new Date() };
    } else if (role === 'constructora') {
       if (!reporte.validacion.subcontrata.validado) {
          return { success: false, message: 'El reporte debe ser validado primero por la Subcontrata.' };
      }
      updateData['validacion.constructora'] = { validado: true, timestamp: new Date() };
    }

    await updateDoc(reporteRef, updateData);
    const updatedReporte = await getReporteDiarioById(reporteId);

    return { success: true, message: `Reporte validado por ${role} con éxito.`, reporte: updatedReporte || undefined };
  } catch(error: any) {
    console.error(`Error in validateDailyReport for ${reporteId}:`, error);
    return { success: false, message: `Error al validar el reporte: ${error.message}` };
  }
}
