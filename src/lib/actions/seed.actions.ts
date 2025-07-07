// src/lib/actions/seed.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import {
  mockConstructoras,
  mockSubcontratas,
  mockProyectos,
  mockTrabajadores,
  mockReportesDiarios,
} from '@/lib/mockData';
import { revalidatePath } from 'next/cache';

export async function seedDemoData(): Promise<{ success: boolean; message: string; summary?: Record<string, string> }> {
  console.log('[SEED DATA] Seeding process started...');
  const summary: Record<string, string> = {};
  
  try {
    const batch = writeBatch(db);

    // Seed Constructoras
    mockConstructoras.forEach(c => {
      const ref = doc(db, "constructoras", c.id);
      batch.set(ref, c);
    });
    summary.constructoras = `${mockConstructoras.length} constructoras prepared.`;

    // Seed Subcontratas
    mockSubcontratas.forEach(s => {
      const ref = doc(db, "subcontratas", s.id);
      batch.set(ref, s);
    });
    summary.subcontratas = `${mockSubcontratas.length} subcontratas prepared.`;

    // Seed Proyectos
    mockProyectos.forEach(p => {
      const ref = doc(db, "proyectos", p.id);
      batch.set(ref, p);
    });
    summary.proyectos = `${mockProyectos.length} proyectos prepared.`;

    // Seed Trabajadores
    mockTrabajadores.forEach(t => {
      const ref = doc(db, "trabajadores", t.id);
      batch.set(ref, t);
    });
    summary.trabajadores = `${mockTrabajadores.length} trabajadores prepared.`;

    // Seed ReportesDiarios
    mockReportesDiarios.forEach(r => {
      const ref = doc(db, "reportesDiarios", r.id);
      
      // Create a new object for Firestore with Date objects converted to Timestamps.
      // This is crucial for Firestore to store dates correctly.
      const reportDataForFirestore = {
        ...r,
        fecha: Timestamp.fromDate(new Date(r.fecha)),
        timestamp: Timestamp.fromDate(new Date(r.timestamp)),
        validacion: {
          encargado: {
            validado: r.validacion.encargado.validado,
            timestamp: r.validacion.encargado.timestamp ? Timestamp.fromDate(new Date(r.validacion.encargado.timestamp)) : null,
          },
          subcontrata: {
            validado: r.validacion.subcontrata.validado,
            timestamp: r.validacion.subcontrata.timestamp ? Timestamp.fromDate(new Date(r.validacion.subcontrata.timestamp)) : null,
          },
          constructora: {
            validado: r.validacion.constructora.validado,
            timestamp: r.validacion.constructora.timestamp ? Timestamp.fromDate(new Date(r.validacion.constructora.timestamp)) : null,
          },
        },
        modificacionJefeObra: r.modificacionJefeObra ? {
          ...r.modificacionJefeObra,
          timestamp: r.modificacionJefeObra.timestamp ? Timestamp.fromDate(new Date(r.modificacionJefeObra.timestamp)) : null,
        } : r.modificacionJefeObra,
      };
      
      batch.set(ref, reportDataForFirestore);
    });
    summary.reportes = `${mockReportesDiarios.length} reportes diarios prepared.`;

    await batch.commit();
    console.log('[SEED DATA] Batch commit successful.');

    revalidatePath('/(app)', 'layout'); 

    return { success: true, message: 'Datos de demostración creados/actualizados en Firestore con éxito.', summary };

  } catch (error: any) {
    console.error('[SEED DATA] Error seeding data:', error);
    summary.error = error.message;
    return { success: false, message: `Error al crear datos de demostración: ${error.message}`, summary };
  }
}
