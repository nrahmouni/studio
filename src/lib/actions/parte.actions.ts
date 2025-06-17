
// src/lib/actions/parte.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ParteSchema, type Parte } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import {
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
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
  // validado and validadoPor are typically set by a separate action or default to false/null
}).extend({
    // Default validado to false if not provided by specific creation contexts (like control diario)
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

    if (obraIdFiltro && obraIdFiltro !== 'all') {
      // Filter by specific obraId (ensure this obra belongs to the company)
      const obraDocRef = doc(db, "obras", obraIdFiltro);
      const obraDocSnap = await getDoc(obraDocRef);
      if (!obraDocSnap.exists() || obraDocSnap.data().empresaId !== empresaId) {
        console.warn(`Obra ${obraIdFiltro} no encontrada o no pertenece a la empresa ${empresaId}.`);
        return [];
      }
      q = query(partesCollectionRef, where("obraId", "==", obraIdFiltro), orderBy("fecha", "desc"), orderBy("timestamp", "desc"));
    } else {
      // Fetch all obras for the company first
      const obrasRef = collection(db, "obras");
      const obrasQuery = query(obrasRef, where("empresaId", "==", empresaId));
      const obrasSnap = await getDocs(obrasQuery);
      const obraIdsEmpresa = obrasSnap.docs.map(doc => doc.id);

      if (obraIdsEmpresa.length === 0) return []; // No obras for this company, so no partes
      
      // Firestore 'in' query limit is 30. If more obras, this needs pagination or different strategy.
      // For now, assuming company has <30 obras.
      if (obraIdsEmpresa.length > 30) {
          console.warn("Empresa tiene más de 30 obras. El filtro de partes podría ser incompleto o fallar. Implementar paginación.");
           // Fallback to fetching all partes and filtering client-side or implement server-side pagination
          q = query(partesCollectionRef, where("obraId", "in", obraIdsEmpresa.slice(0,30)), orderBy("fecha", "desc"), orderBy("timestamp", "desc"));

      } else {
         q = query(partesCollectionRef, where("obraId", "in", obraIdsEmpresa), orderBy("fecha", "desc"), orderBy("timestamp", "desc"));
      }
    }

    const querySnapshot = await getDocs(q);
    const partes: Parte[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const parteDataWithDates = {
        ...data,
        fecha: (data.fecha as Timestamp).toDate(),
        timestamp: (data.timestamp as Timestamp).toDate(),
      };
      const parseResult = ParteSchema.safeParse({ id: docSnap.id, ...parteDataWithDates });
      if (parseResult.success) {
        partes.push(parseResult.data);
      } else {
         console.warn(`Invalid parte data in Firestore for ID ${docSnap.id}:`, parseResult.error.flatten().fieldErrors);
      }
    });
    return partes;
  } catch (error) {
    console.error("Error fetching partes:", error);
    return [];
  }
}

export async function getParteById(parteId: string, empresaIdAuth: string): Promise<Parte | null> {
  try {
    const parteDocRef = doc(db, "partes", parteId);
    const parteDocSnap = await getDoc(parteDocRef);

    if (parteDocSnap.exists()) {
      const parteData = parteDocSnap.data();
      // Verify this parte belongs to an obra of the authenticated empresa
      const obraDocRef = doc(db, "obras", parteData.obraId);
      const obraDocSnap = await getDoc(obraDocRef);
      if (!obraDocSnap.exists() || obraDocSnap.data().empresaId !== empresaIdAuth) {
        console.warn(`Security: Attempt to access parte ${parteId} not belonging to empresa ${empresaIdAuth}`);
        return null;
      }

      const parteDataWithDates = {
        ...parteData,
        fecha: (parteData.fecha as Timestamp).toDate(),
        timestamp: (parteData.timestamp as Timestamp).toDate(),
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
  } catch (error) {
    console.error("Error fetching parte by ID:", error);
    return null;
  }
}


export async function getParteByWorkerObraDate(
  usuarioId: string,
  obraId: string,
  fecha: Date,
  empresaId: string // To ensure obra belongs to company, though indirect here
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
      const docSnap = querySnapshot.docs[0]; // Assuming one parte per worker/obra/date
      const data = docSnap.data();
      // Verify obra belongs to company if needed, though this function might be called internally where that's already established
      const obraDoc = await getDoc(doc(db, "obras", data.obraId));
      if (!obraDoc.exists() || obraDoc.data().empresaId !== empresaId) {
        return null; // Parte is for an obra not of this empresa
      }

      const parteDataWithDates = {
        ...data,
        fecha: (data.fecha as Timestamp).toDate(),
        timestamp: (data.timestamp as Timestamp).toDate(),
      };
      const parseResult = ParteSchema.safeParse({id: docSnap.id, ...parteDataWithDates});
      if (parseResult.success) return parseResult.data;
      console.warn("Invalid parte data for worker/obra/date", parseResult.error);
    }
    return null;
  } catch (error) {
    console.error("Error fetching parte by worker/obra/date:", error);
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

    const parteToCreate = {
      ...validatedInputData,
      id: newParteId,
      fecha: Timestamp.fromDate(new Date(validatedInputData.fecha)), // Ensure it's a Firestore Timestamp
      horasTrabajadas: validatedInputData.horasTrabajadas === undefined ? null : validatedInputData.horasTrabajadas,
      incidencias: validatedInputData.incidencias || '',
      tareasSeleccionadas: validatedInputData.tareasSeleccionadas || [],
      fotosURLs: validatedInputData.fotosURLs || [],
      firmaURL: validatedInputData.firmaURL || null,
      validado: validatedInputData.validado || false, // Default to false if not provided
      validadoPor: validatedInputData.validadoPor || null,
      timestamp: serverTimestamp(), // Firestore server timestamp
    };
    
    // Validate with full schema before saving
    const finalParteDataForDb = ParteSchema.omit({dataAIHint:true}).parse(parteToCreate);
    await setDoc(newParteRef, finalParteDataForDb);

    revalidatePath('/(app)/partes');
    revalidatePath(`/(app)/partes/new`);
    
    // Fetch the created parte to return it with server-generated timestamps resolved
    const createdParteSnap = await getDoc(newParteRef);
    const createdData = createdParteSnap.data();
    const parteResult = ParteSchema.parse({
        id: createdParteSnap.id,
        ...createdData,
        fecha: (createdData?.fecha as Timestamp).toDate(),
        timestamp: (createdData?.timestamp as Timestamp).toDate(),
    });

    return { success: true, message: 'Nuevo parte de trabajo registrado.', parte: parteResult };
  } catch (error: any) {
     console.error("Error creating parte in Firestore:", error);
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
    // Remove undefined fields
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    await updateDoc(parteDocRef, dataToUpdate);
    
    const updatedParteSnap = await getDoc(parteDocRef);
    const updatedData = updatedParteSnap.data();
    const parteResult = ParteSchema.parse({ 
        id: updatedParteSnap.id, 
        ...updatedData,
        fecha: (updatedData?.fecha as Timestamp).toDate(),
        timestamp: (updatedData?.timestamp as Timestamp).toDate(),
    });

    revalidatePath('/(app)/partes');
    revalidatePath(`/(app)/partes/${parteId}`);

    return { success: true, message: 'Parte actualizado con éxito.', parte: parteResult };
  } catch (error: any) {
    console.error("Error updating parte in Firestore:", error);
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
        return { success: false, message: 'No autorizado para validar este parte.' };
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
    const parteResult = ParteSchema.parse({ 
        id: updatedParteSnap.id, 
        ...updatedData,
        fecha: (updatedData?.fecha as Timestamp).toDate(),
        timestamp: (updatedData?.timestamp as Timestamp).toDate(),
    });

    revalidatePath('/(app)/partes');
    revalidatePath(`/(app)/partes/${parteId}`);

    return { success: true, message: 'Parte validado con éxito.', parte: parteResult };
  } catch (error: any) {
    console.error("Error validating parte:", error);
    return { success: false, message: `Error al validar el parte: ${error.message || "Error desconocido."}` };
  }
}
