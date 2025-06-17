
// src/lib/actions/controlDiario.actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  ControlDiarioObraSchema,
  type ControlDiarioObra,
  type ControlDiarioRegistroTrabajador,
  type ControlDiarioObraFormData,
  type Parte, 
  UsuarioFirebaseSchema
} from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { createParte, updateParte, getParteByWorkerObraDate } from './parte.actions';

export async function getControlDiario(
  obraId: string,
  fecha: Date,
  jefeObraId: string, // ID of the user viewing/requesting the control
  empresaId: string    // Company ID of the user viewing/requesting
): Promise<ControlDiarioObra | null> {
  
  const fechaString = fecha.toISOString().split('T')[0]; 
  const controlDiarioId = `${obraId}-${fechaString}`;
  const controlDiarioDocRef = doc(db, "controlDiario", controlDiarioId);

  try {
    // Verify obra belongs to the company
    const obraDocRef = doc(db, "obras", obraId);
    const obraSnap = await getDoc(obraDocRef);
    if (!obraSnap.exists() || obraSnap.data().empresaId !== empresaId) {
      console.error(`Acceso denegado o obra no encontrada: Obra ID ${obraId} para Empresa ID ${empresaId}`);
      return null;
    }
    const obraData = obraSnap.data();

    const controlDiarioSnap = await getDoc(controlDiarioDocRef);

    let finalRegistros: ControlDiarioRegistroTrabajador[] = [];

    // Fetch all active workers assigned to this obra within the company
    const usersCollectionRef = collection(db, "usuarios");
    const assignedWorkersQuery = query(
      usersCollectionRef,
      where("empresaId", "==", empresaId),
      where("rol", "==", "trabajador"),
      where("activo", "==", true),
      where("obrasAsignadas", "array-contains", obraId)
    );
    const assignedWorkersSnap = await getDocs(assignedWorkersQuery);
    const assignedWorkerDetails: Record<string, { id: string, nombre: string }> = {};
    assignedWorkersSnap.forEach(doc => {
      assignedWorkerDetails[doc.id] = { id: doc.id, nombre: doc.data().nombre };
    });


    if (controlDiarioSnap.exists()) {
      const existingData = controlDiarioSnap.data();
      const parsedExistingData = ControlDiarioObraSchema.partial().safeParse({
          ...existingData,
          fecha: (existingData.fecha as Timestamp).toDate(),
          lastModified: existingData.lastModified ? (existingData.lastModified as Timestamp).toDate() : new Date(),
      });

      if (!parsedExistingData.success) {
          console.warn("Invalid existing control diario data:", parsedExistingData.error);
          // Proceed to build shell, but log this
      } else {
          finalRegistros = parsedExistingData.data.registrosTrabajadores || [];
      }

      // Ensure all currently assigned workers are in the list, add if missing
      Object.values(assignedWorkerDetails).forEach(worker => {
        if (!finalRegistros.find(rt => rt.usuarioId === worker.id)) {
          finalRegistros.push({
            usuarioId: worker.id,
            nombreTrabajador: worker.nombre,
            asistencia: false,
            horaInicio: null,
            horaFin: null,
            horasReportadas: null,
            validadoPorJefeObra: false,
          });
        } else {
            // Ensure name is up-to-date
            const registro = finalRegistros.find(rt => rt.usuarioId === worker.id);
            if (registro && registro.nombreTrabajador !== worker.nombre) {
                registro.nombreTrabajador = worker.nombre;
            }
        }
      });
      // Remove workers no longer assigned or inactive (if they have no data for this day)
      finalRegistros = finalRegistros.filter(rt => 
        assignedWorkerDetails[rt.usuarioId] || (rt.asistencia || rt.horasReportadas) // Keep if data exists
      );


    } else { // No existing record, create a new shell
      finalRegistros = Object.values(assignedWorkerDetails).map(worker => ({
        usuarioId: worker.id,
        nombreTrabajador: worker.nombre,
        asistencia: false,
        horaInicio: null,
        horaFin: null,
        horasReportadas: null,
        validadoPorJefeObra: false,
      }));
    }
    
    finalRegistros.sort((a, b) => (a.nombreTrabajador || '').localeCompare(b.nombreTrabajador || ''));
    
    const resultShell: ControlDiarioObra = {
        id: controlDiarioId,
        obraId: obraId,
        fecha: fecha,
        jefeObraId: jefeObraId, // The current user acting as JO
        registrosTrabajadores: finalRegistros,
        firmaJefeObraURL: controlDiarioSnap.exists() ? controlDiarioSnap.data().firmaJefeObraURL : null,
        lastModified: controlDiarioSnap.exists() ? (controlDiarioSnap.data().lastModified as Timestamp).toDate() : new Date(),
    };
    
    return ControlDiarioObraSchema.parse(resultShell);

  } catch (error) {
    console.error("Error getting control diario:", error);
    return null;
  }
}

export async function saveControlDiario(
  data: ControlDiarioObraFormData, 
  currentJefeObraId: string
): Promise<{ success: boolean; message: string; controlDiario?: ControlDiarioObra }> {

  const dataToValidate = {
    ...data, 
    jefeObraId: currentJefeObraId,
    // Ensure fecha is a JS Date for validation, will be converted to Timestamp for Firestore
    fecha: new Date(data.fecha), 
  };

  const InternalValidationSchema = ControlDiarioObraSchema.omit({
    id: true, 
    lastModified: true,
  });

  const validationResult = InternalValidationSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    console.error("Validation error saving control diario:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const validatedData = validationResult.data;
  const controlDiarioId = `${validatedData.obraId}-${validatedData.fecha.toISOString().split('T')[0]}`;
  const controlDiarioDocRef = doc(db, "controlDiario", controlDiarioId);
  
  try {
    const obraDelControlRef = doc(db, "obras", validatedData.obraId);
    const obraDelControlSnap = await getDoc(obraDelControlRef);
    if (!obraDelControlSnap.exists()) {
      return { success: false, message: 'Obra no encontrada para este control diario.' };
    }
    const empresaId = obraDelControlSnap.data().empresaId;

    const recordToSaveForFirestore = {
      ...validatedData,
      id: controlDiarioId, // ensure id is part of the data being set/updated
      fecha: Timestamp.fromDate(validatedData.fecha), // Convert JS Date to Firestore Timestamp
      lastModified: serverTimestamp(),
    };

    await setDoc(controlDiarioDocRef, recordToSaveForFirestore, { merge: true });

    const jefeObraActualSnap = await getDoc(doc(db, "usuarios", currentJefeObraId));
    const nombreJefeObra = jefeObraActualSnap.exists() ? jefeObraActualSnap.data().nombre : 'Jefe de Obra';

    for (const registro of validatedData.registrosTrabajadores) {
      if (registro.asistencia && registro.horasReportadas != null && registro.horasReportadas > 0) {
        const existingParte = await getParteByWorkerObraDate(
          registro.usuarioId,
          validatedData.obraId,
          validatedData.fecha,
          empresaId 
        );

        const parteBaseData = {
          usuarioId: registro.usuarioId,
          obraId: validatedData.obraId,
          fecha: validatedData.fecha, // JS Date
          horasTrabajadas: registro.horasReportadas,
          validado: registro.validadoPorJefeObra,
          validadoPor: registro.validadoPorJefeObra ? currentJefeObraId : null,
        };

        if (existingParte) {
            if (!existingParte.validado || registro.validadoPorJefeObra) { // Update if not validated or if JO is validating it now
                const parteUpdateData = {
                    ...parteBaseData,
                    tareasRealizadas: existingParte.tareasRealizadas.includes("Control Diario") 
                    ? existingParte.tareasRealizadas 
                    : `${existingParte.tareasRealizadas}\n(Horas/asistencia validadas vía Control Diario por ${nombreJefeObra} el ${new Date().toLocaleDateString('es-ES')}).`.trim(),
                    // Keep other existing parte fields like incidencias, fotos, etc.
                    incidencias: existingParte.incidencias,
                    tareasSeleccionadas: existingParte.tareasSeleccionadas,
                    fotosURLs: existingParte.fotosURLs,
                    firmaURL: existingParte.firmaURL,
                };
                await updateParte(existingParte.id, parteUpdateData as Partial<Omit<Parte, 'id' | 'usuarioId' | 'timestamp'>>);
            }
        } else {
          const parteCreateData = {
            ...parteBaseData,
            tareasRealizadas: `Trabajo registrado y validado mediante Control Diario por ${nombreJefeObra}. Asistencia: Sí. Horas: ${registro.horasReportadas}.`,
            incidencias: '', 
            tareasSeleccionadas: ['Control Diario'], // Add a default task type
            fotosURLs: [],
            firmaURL: null,
          };
          await createParte(parteCreateData);
        }
      }
    }

    revalidatePath('/(app)/control-diario');
    revalidatePath('/(app)/partes'); 

    const savedSnap = await getDoc(controlDiarioDocRef);
    const savedData = savedSnap.data();
    const controlDiarioResult = ControlDiarioObraSchema.parse({
        id: savedSnap.id,
        ...savedData,
        fecha: (savedData?.fecha as Timestamp).toDate(),
        lastModified: (savedData?.lastModified as Timestamp).toDate(),
    });

    return { success: true, message: 'Control diario guardado y partes de trabajo actualizados/creados.', controlDiario: controlDiarioResult };
  } catch (error: any) {
    console.error("Error saving control diario:", error);
    return { success: false, message: `Error al guardar el control diario: ${error.message || "Error desconocido."}` };
  }
}

// type UpdateParteData = Partial<Omit<Parte, 'id' | 'usuarioId' | 'timestamp'>>;
