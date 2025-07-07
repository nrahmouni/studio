// src/lib/actions/app.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import { collection, doc, getDoc, getDocs, query, where, Timestamp, setDoc, serverTimestamp } from 'firebase/firestore';
import { Subcontrata, Proyecto, Trabajador, ReporteDiarioSchema, type ReporteDiario, type ReporteTrabajador } from '../types';
import { revalidatePath } from 'next/cache';

// --- Data Fetching for Encargado ---

export async function getSubcontratas(): Promise<Subcontrata[]> {
  const snapshot = await getDocs(collection(db, 'subcontratas'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subcontrata));
}

export async function getProyectosBySubcontrata(subcontrataId: string): Promise<Proyecto[]> {
  const q = query(collection(db, 'proyectos'), where('subcontrataId', '==', subcontrataId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proyecto));
}

export async function getTrabajadoresByProyecto(proyectoId: string): Promise<Trabajador[]> {
    const q = query(collection(db, 'trabajadores'), where('proyectosAsignados', 'array-contains', proyectoId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trabajador));
}

// --- Report Submission ---

export async function saveDailyReport(
  proyectoId: string,
  encargadoId: string,
  trabajadoresReporte: ReporteTrabajador[]
): Promise<{ success: boolean; message: string }> {
  
  const fecha = new Date();
  const fechaString = fecha.toISOString().split('T')[0];
  const reporteId = `${proyectoId}-${fechaString}`;

  try {
    const reporteRef = doc(db, 'reportesDiarios', reporteId);

    const reporteData: Omit<ReporteDiario, 'id' | 'timestamp'> = {
        proyectoId,
        fecha,
        trabajadores: trabajadoresReporte,
        encargadoId,
        validacion: {
            encargado: { validado: true, timestamp: new Date() },
            subcontrata: { validado: false, timestamp: null },
            constructora: { validado: false, timestamp: null },
        }
    };

    // Ensure it matches schema before sending to Firestore
    const validatedData = ReporteDiarioSchema.omit({id: true, timestamp: true}).parse(reporteData);
    
    await setDoc(reporteRef, {
        ...validatedData,
        fecha: Timestamp.fromDate(validatedData.fecha),
        timestamp: serverTimestamp(),
        'validacion.encargado.timestamp': serverTimestamp()
    });
    
    revalidatePath('/encargado');

    return { success: true, message: 'Reporte diario guardado y validado con éxito.' };
  } catch(error: any) {
    console.error("Error saving daily report:", error);
    return { success: false, message: `Error al guardar el reporte: ${error.message}` };
  }
}
