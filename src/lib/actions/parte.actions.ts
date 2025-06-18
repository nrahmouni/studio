
// src/lib/actions/parte.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ParteSchema, type Parte } from '@/lib/types';
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
  Timestamp,
  orderBy
} from 'firebase/firestore';

const CreateParteInputSchemaFirebase = ParteSchema.pick({
  usuarioId: true,
  obraId: true,
  fecha: true,
  tareasRealizadas: true,
  horasTrabajadas: true,
  incidencias: true,
  tareasSeleccionadas: true,
  fotosURLs: true,
  firmaURL: true,
}).extend({
    validado: z.boolean().default(false).optional(),
    validadoPor: z.string().optional().nullable(),
});
type CreateParteDataFirebase = z.infer<typeof CreateParteInputSchemaFirebase>;

const UpdateParteDataSchemaFirebase = ParteSchema.partial().pick({
  obraId: true,
  fecha: true,
  tareasRealizadas: true,
  horasTrabajadas: true,
  incidencias: true,
  tareasSeleccionadas: true,
  fotosURLs: true,
  firmaURL: true,
  validado: true,
  validadoPor: true,
  dataAIHint: true,
});
type UpdateParteDataFirebase = z.infer<typeof UpdateParteDataSchemaFirebase>;

export async function getPartesByEmpresaYObra(empresaId: string, obraIdFiltro?: string): Promise<Parte[]> {
  try {
    const partesCollectionRef = collection(db, "partes");
    let q;

    const obrasRef = collection(db, "obras");
    const obrasQuery = query(obrasRef, where("empresaId", "==", empresaId));
    const obrasSnap = await getDocs(obrasQuery);
    const obraIdsEmpresa = obrasSnap.docs.map(doc => doc.id);

    if (obraIdsEmpresa.length === 0) return [];

    let targetObraIds = obraIdsEmpresa;
    if (obraIdFiltro && obraIdFiltro !== 'all') {
      if (!obraIdsEmpresa.includes(obraIdFiltro)) {
        console.warn(`Obra ${obraIdFiltro} no encontrada o no pertenece a la empresa ${empresaId}.`);
        return [];
      }
      targetObraIds = [obraIdFiltro];
    }
    
    if (targetObraIds.length === 0) return [];


    // Firestore 'in' query limit is 30.
    if (targetObraIds.length > 30) {
        console.warn("Empresa tiene más de 30 obras. El filtro de partes podría ser incompleto. Mostrando para las primeras 30 obras.");
        q = query(partesCollectionRef, where("obraId", "in", targetObraIds.slice(0,30)), orderBy("fecha", "desc"), orderBy("timestamp", "desc"));
    } else {
         q = query(partesCollectionRef, where("obraId", "in", targetObraIds), orderBy("fecha", "desc"), orderBy("timestamp", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const partes: Parte[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const parteDataWithDates = {
        ...data,
        fecha: data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha || Date.now()),
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
      };
      const parseResult = ParteSchema.safeParse({ id: docSnap.id, ...parteDataWithDates });
      if (parseResult.success) {
        partes.push(parseResult.data);
      } else {
         console.warn(`Invalid parte data in Firestore for ID ${docSnap.id}:`, parseResult.error.flatten().fieldErrors);
      }
    });
    return partes;
  } catch (error: any) {
    console.error("Error fetching partes by empresa and obra:", error.message, error.stack);
    return [];
  }
}

export async function getParteById(parteId: string, empresaIdAuth: string): Promise<Parte | null> {
  try {
    const parteDocRef = doc(db, "partes", parteId);
    const parteDocSnap = await getDoc(parteDocRef);

    if (parteDocSnap.exists()) {
      const parteData = parteDocSnap.data();
      const obraDocRef = doc(db, "obras", parteData.obraId);
      const obraDocSnap = await getDoc(obraDocRef);
      if (!obraDocSnap.exists() || obraDocSnap.data().empresaId !== empresaIdAuth) {
        console.warn(`Security: Attempt to access parte ${parteId} not belonging to empresa ${empresaIdAuth}`);
        return null;
      }

      const parteDataWithDates = {
        ...parteData,
        fecha: parteData.fecha instanceof Timestamp ? parteData.fecha.toDate() : new Date(parteData.fecha || Date.now()),
        timestamp: parteData.timestamp instanceof Timestamp ? parteData.timestamp.toDate() : new Date(parteData.timestamp || Date.now()),
      };
       const parseResult = ParteSchema.safeParse({ id: parteDocSnap.id, ...parteDataWithDates });
        if (parseResult.success) {
            return parseResult.data;
        } else {
            console.warn(`Invalid parte data in Firestore for ID ${parteId}:`, parseResult.error.flatten().fieldErrors);
            return null;
        }
    }
    return null;
  } catch (error: any) {
    console.error(`Error fetching parte by ID ${parteId}:`, error.message, error.stack);
    return null;
  }
}


export async function getParteByWorkerObraDate(
  usuarioId: string,
  obraId: string,
  fecha: Date,
  empresaId: string 
): Promise<Parte | null> {
  try {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0,0,0,0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23,59,59,999);

    const q = query(
      collection(db, "partes"),
      where("usuarioId", "==", usuarioId),
      where("obraId", "==", obraId),
      where("fecha", ">=", Timestamp.fromDate(fechaInicio)),
      where("fecha", "<=", Timestamp.fromDate(fechaFin))
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      const obraDoc = await getDoc(doc(db, "obras", data.obraId));
      if (!obraDoc.exists() || obraDoc.data().empresaId !== empresaId) {
        console.warn(`Parte found for worker ${usuarioId} in obra ${data.obraId}, but obra does not belong to empresa ${empresaId}`);
        return null; 
      }

      const parteDataWithDates = {
        ...data,
        fecha: data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(data.fecha || Date.now()),
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
      };
      const parseResult = ParteSchema.safeParse({id: docSnap.id, ...parteDataWithDates});
      if (parseResult.success) return parseResult.data;
      console.warn(`Invalid parte data for worker ${usuarioId}, obra ${obraId}, date ${fecha.toISOString()}:`, parseResult.error.flatten().fieldErrors);
    }
    return null;
  } catch (error: any) {
    console.error(`Error fetching parte by worker/obra/date (w:${usuarioId}, o:${obraId}, d:${fecha.toISOString()}):`, error.message, error.stack);
    return null;
  }
}


export async function createParte(data: CreateParteDataFirebase): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const validationResult = CreateParteInputSchemaFirebase.safeParse(data);
  if (!validationResult.success) {
    console.error("Validation errors creating parte:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const validatedInputData = validationResult.data;
  
  try {
    const newParteRef = doc(collection(db, "partes"));
    const newParteId = newParteRef.id;

    // Ensure all fields are defined as per ParteSchema before final parse for DB
    const rawParteToCreateForDb = {
      id: newParteId,
      usuarioId: validatedInputData.usuarioId,
      obraId: validatedInputData.obraId,
      fecha: new Date(validatedInputData.fecha), // Ensure it's a Date object
      tareasRealizadas: validatedInputData.tareasRealizadas,
      horasTrabajadas: validatedInputData.horasTrabajadas === undefined ? null : validatedInputData.horasTrabajadas,
      incidencias: validatedInputData.incidencias || '',
      tareasSeleccionadas: validatedInputData.tareasSeleccionadas || [],
      fotosURLs: validatedInputData.fotosURLs || [],
      firmaURL: validatedInputData.firmaURL || null,
      validado: validatedInputData.validado || false,
      validadoPor: validatedInputData.validadoPor || null,
      timestamp: new Date(), // Will be replaced by serverTimestamp
      dataAIHint: undefined, // Explicitly undefined if not provided
    };
    
    const finalParteDataForDb = ParteSchema.parse(rawParteToCreateForDb);
    
    const firestoreParteData = {
      ...finalParteDataForDb,
      fecha: Timestamp.fromDate(finalParteDataForDb.fecha),
      timestamp: serverTimestamp(), // Firestore server timestamp
    };
    // Remove id from data being sent to setDoc as it's the doc ref's id
    const { id, ...dataToSet } = firestoreParteData;

    await setDoc(newParteRef, dataToSet);

    revalidatePath('/(app)/partes');
    revalidatePath(`/(app)/partes/new`);
    
    const createdParteSnap = await getDoc(newParteRef);
    const createdData = createdParteSnap.data();
    if (!createdData) {
        throw new Error("Document not found after creation");
    }
    
    const parteResult = ParteSchema.parse({
        id: createdParteSnap.id,
        ...createdData,
        fecha: (createdData.fecha as Timestamp).toDate(),
        timestamp: (createdData.timestamp as Timestamp).toDate(),
    });

    return { success: true, message: 'Nuevo parte de trabajo registrado.', parte: parteResult };
  } catch (error: any) {
     console.error("Error creating parte in Firestore:", error.message, error.stack);
     if (error instanceof z.ZodError) {
        return { success: false, message: `Error de validación Zod al crear parte: ${JSON.stringify(error.flatten().fieldErrors)}` };
     }
    return { success: false, message: `Error al registrar el parte: ${error.message || "Error desconocido."}` };
  }
}

export async function updateParte(parteId: string, data: UpdateParteDataFirebase): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const parteDocRef = doc(db, "partes", parteId);
  try {
    const currentParteSnap = await getDoc(parteDocRef);
    if (!currentParteSnap.exists()) {
      return { success: false, message: 'Parte no encontrado.' };
    }

    const validationResult = UpdateParteDataSchemaFirebase.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation errors updating parte:", validationResult.error.flatten().fieldErrors);
      return { success: false, message: `Error de validación al actualizar: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
    }
    
    const dataToUpdate: any = { ...validationResult.data, updatedAt: serverTimestamp() };
    if (dataToUpdate.fecha) dataToUpdate.fecha = Timestamp.fromDate(new Date(dataToUpdate.fecha));
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);

    await updateDoc(parteDocRef, dataToUpdate);
    
    const updatedParteSnap = await getDoc(parteDocRef);
    const updatedData = updatedParteSnap.data();
     if (!updatedData) {
        throw new Error("Document not found after update");
    }
    const parteResult = ParteSchema.parse({ 
        id: updatedParteSnap.id, 
        ...updatedData,
        fecha: (updatedData.fecha as Timestamp).toDate(),
        timestamp: (updatedData.timestamp as Timestamp).toDate(), // Assuming timestamp is also updated or present
        updatedAt: updatedData.updatedAt ? (updatedData.updatedAt as Timestamp).toDate() : new Date() // Handle potential missing updatedAt
    });

    revalidatePath('/(app)/partes');
    revalidatePath(`/(app)/partes/${parteId}`);

    return { success: true, message: 'Parte actualizado con éxito.', parte: parteResult };
  } catch (error: any) {
    console.error(`Error updating parte ${parteId}:`, error.message, error.stack);
    if (error instanceof z.ZodError) {
        return { success: false, message: `Error de validación Zod al actualizar parte: ${JSON.stringify(error.flatten().fieldErrors)}` };
     }
    return { success: false, message: `Error al actualizar el parte: ${error.message || "Error desconocido."}` };
  }
}

export async function validateParte(parteId: string, validadorId: string, empresaIdAuth: string): Promise<{ success: boolean; message: string; parte?: Parte }> {
  const parteDocRef = doc(db, "partes", parteId);
  try {
    const parteSnap = await getDoc(parteDocRef);
    if (!parteSnap.exists()) {
      return { success: false, message: 'Parte no encontrado.' };
    }

    const parteData = parteSnap.data();
    const obraDoc = await getDoc(doc(db, "obras", parteData.obraId));
    if (!obraDoc.exists() || obraDoc.data().empresaId !== empresaIdAuth) {
        return { success: false, message: 'No autorizado para validar este parte (obra no pertenece a empresa).' };
    }
    
    const validadorDoc = await getDoc(doc(db, "usuarios", validadorId));
    if (!validadorDoc.exists() || (validadorDoc.data().rol !== 'admin' && validadorDoc.data().rol !== 'jefeObra') || validadorDoc.data().empresaId !== empresaIdAuth) {
        return { success: false, message: 'Usuario validador no autorizado o no pertenece a la empresa.' };
    }

    await updateDoc(parteDocRef, {
      validado: true,
      validadoPor: validadorId,
      updatedAt: serverTimestamp()
    });

    const updatedParteSnap = await getDoc(parteDocRef);
    const updatedData = updatedParteSnap.data();
    if (!updatedData) {
        throw new Error("Document not found after validation update");
    }
    const parteResult = ParteSchema.parse({ 
        id: updatedParteSnap.id, 
        ...updatedData,
        fecha: (updatedData.fecha as Timestamp).toDate(),
        timestamp: (updatedData.timestamp as Timestamp).toDate(),
        updatedAt: updatedData.updatedAt ? (updatedData.updatedAt as Timestamp).toDate() : new Date()
    });

    revalidatePath('/(app)/partes');
    revalidatePath(`/(app)/partes/${parteId}`);

    return { success: true, message: 'Parte validado con éxito.', parte: parteResult };
  } catch (error: any) {
    console.error(`Error validating parte ${parteId}:`, error.message, error.stack);
     if (error instanceof z.ZodError) {
        return { success: false, message: `Error de validación Zod al validar parte: ${JSON.stringify(error.flatten().fieldErrors)}` };
     }
    return { success: false, message: `Error al validar el parte: ${error.message || "Error desconocido."}` };
  }
}

