// src/lib/actions/seed.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
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
      batch.set(ref, r);
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
