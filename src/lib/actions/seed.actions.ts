// src/lib/actions/seed.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function seedDemoData(): Promise<{ success: boolean; message: string; summary?: Record<string, string> }> {
  const testDocId = `test-doc-${new Date().getTime()}`;
  const testDocRef = doc(db, "connectivity-tests", testDocId);
  const summary: Record<string, string> = {};

  try {
    console.log(`[SEED_DATA_TEST] Starting simple connectivity test. Writing to: connectivity-tests/${testDocId}`);
    console.time('FirestoreSimpleWrite');

    await setDoc(testDocRef, {
      message: "Connectivity test successful",
      timestamp: serverTimestamp(),
    });

    console.timeEnd('FirestoreSimpleWrite');
    console.log(`[SEED_DATA_TEST] Simple write successful.`);
    
    summary.test_result = `Successfully wrote document ${testDocId} to the 'connectivity-tests' collection.`;
    
    // No es necesario revalidar la ruta para esta prueba.
    // revalidatePath('/(app)', 'layout');

    return { success: true, message: 'Prueba de conectividad con Firestore exitosa.', summary };

  } catch (error: any) {
    console.error('--- [SEED DATA TEST] CRITICAL ERROR ---');
    console.error(`Error during simple write test: ${error.message}`);
    if (error.stack) console.error(`Stack: ${error.stack}`);
    
    let userMessage = `Error en la prueba de conectividad: ${error.message}`;
    if (error.code === 'permission-denied') {
      userMessage = "Error de Permiso en Firestore. La base de datos denegó el acceso. Por favor, asegúrate de que tus reglas de seguridad permiten la escritura (allow write: if true;).";
    }
    
    summary.error = userMessage;
    return { success: false, message: userMessage, summary };
  }
}
