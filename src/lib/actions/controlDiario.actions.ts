
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
  jefeObraId: string, 
  empresaId: string    
): Promise<ControlDiarioObra | null> {
  
  const fechaString = fecha.toISOString().split('T')[0]; 
  const controlDiarioId = `${obraId}-${fechaString}`;
  const controlDiarioDocRef = doc(db, "controlDiario", controlDiarioId);

  try {
    const obraDocRef = doc(db, "obras", obraId);
    const obraSnap = await getDoc(obraDocRef);
    if (!obraSnap.exists() || obraSnap.data().empresaId !== empresaId) {
      console.error(`Acceso denegado o obra no encontrada: Obra ID ${obraId} para Empresa ID ${empresaId}`);
      return null;
    }

    const controlDiarioSnap = await getDoc(controlDiarioDocRef);
    let finalRegistros: ControlDiarioRegistroTrabajador[] = [];
    const existingDataRaw = controlDiarioSnap.exists() ? controlDiarioSnap.data() : {};

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
      const parsedExistingData = ControlDiarioObraSchema.pick({registrosTrabajadores: true}).partial().safeParse({
          registrosTrabajadores: existingDataRaw.registrosTrabajadores,
      });

      if (!parsedExistingData.success) {
          console.warn("Invalid existing control diario registros data:", parsedExistingData.error);
      } else {
          finalRegistros = parsedExistingData.data.registrosTrabajadores || [];
      }

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
            const registro = finalRegistros.find(rt => rt.usuarioId === worker.id);
            if (registro && registro.nombreTrabajador !== worker.nombre) {
                registro.nombreTrabajador = worker.nombre;
            }
        }
      });
      finalRegistros = finalRegistros.filter(rt => 
        assignedWorkerDetails[rt.usuarioId] || (rt.asistencia || rt.horasReportadas)
      );

    } else { 
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
    
    let lastModifiedDate: Date;
    if (controlDiarioSnap.exists() && existingDataRaw.lastModified instanceof Timestamp) {
        lastModifiedDate = existingDataRaw.lastModified.toDate();
    } else if (controlDiarioSnap.exists()) {
        lastModifiedDate = new Date(); // Fallback if timestamp is missing or not correct type
    } else {
        lastModifiedDate = new Date(); // For new shell
    }

    const resultShell: ControlDiarioObra = {
        id: controlDiarioId,
        obraId: obraId,
        fecha: fecha,
        jefeObraId: jefeObraId, 
        registrosTrabajadores: finalRegistros,
        firmaJefeObraURL: existingDataRaw.firmaJefeObraURL ?? null,
        lastModified: lastModifiedDate,
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
      id: controlDiarioId, 
      fecha: Timestamp.fromDate(validatedData.fecha), 
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
          fecha: validatedData.fecha, 
          horasTrabajadas: registro.horasReportadas,
          validado: registro.validadoPorJefeObra,
          validadoPor: registro.validadoPorJefeObra ? currentJefeObraId : null,
        };

        if (existingParte) {
            if (!existingParte.validado || registro.validadoPorJefeObra) { 
                const parteUpdateData = {
                    ...parteBaseData,
                    tareasRealizadas: existingParte.tareasRealizadas.includes("Control Diario") 
                    ? existingParte.tareasRealizadas 
                    : `${existingParte.tareasRealizadas}\n(Horas/asistencia validadas vía Control Diario por ${nombreJefeObra} el ${new Date().toLocaleDateString('es-ES')}).`.trim(),
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
            tareasSeleccionadas: ['Control Diario'], 
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
    if (!savedSnap.exists()) {
      console.error("ControlDiario document not found after save:", controlDiarioId);
      return { success: false, message: "Error: el documento de control diario no se encontró después de guardar." };
    }
    const savedData = savedSnap.data();
    
    const fechaFromDb = savedData.fecha instanceof Timestamp ? savedData.fecha.toDate() : new Date();
    const lastModifiedFromDb = savedData.lastModified instanceof Timestamp ? savedData.lastModified.toDate() : new Date();

    const parseResult = ControlDiarioObraSchema.safeParse({
        id: savedSnap.id,
        ...savedData,
        fecha: fechaFromDb,
        lastModified: lastModifiedFromDb,
    });

    if (!parseResult.success) {
        console.error("Error parsing saved ControlDiario:", parseResult.error.flatten().fieldErrors);
        return { success: false, message: "Error al procesar los datos guardados del control diario." };
    }
    const controlDiarioResult = parseResult.data;

    return { success: true, message: 'Control diario guardado y partes de trabajo actualizados/creados.', controlDiario: controlDiarioResult };
  } catch (error: any) {
    console.error("Error saving control diario:", error);
    return { success: false, message: `Error al guardar el control diario: ${error.message || "Error desconocido."}` };
  }
}

```