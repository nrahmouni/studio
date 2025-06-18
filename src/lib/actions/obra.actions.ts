
// src/lib/actions/obra.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObraSchema, type Obra, type UsuarioFirebase, CostoCategoriaSchema } from '@/lib/types';
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
  writeBatch,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const CreateObraFormInputSchemaFirebase = ObraSchema.pick({ 
  nombre: true,
  direccion: true,
  clienteNombre: true,
  fechaInicio: true,
  descripcion: true,
}).extend({
  fechaFinEstimada: z.date().optional().nullable(),
  jefeObraEmail: z.string().email("Email del jefe de obra inválido").optional().or(z.literal('')),
});
type CreateObraFormInputDataFirebase = z.infer<typeof CreateObraFormInputSchemaFirebase>;


export async function getObrasByEmpresaId(empresaId: string): Promise<Obra[]> {
  try {
    const obrasCollectionRef = collection(db, "obras");
    const q = query(obrasCollectionRef, where("empresaId", "==", empresaId));
    const querySnapshot = await getDocs(q);
    
    const obras: Obra[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const obraDataWithDates = {
        ...data,
        fechaInicio: data.fechaInicio instanceof Timestamp ? data.fechaInicio.toDate() : (data.fechaInicio ? new Date(data.fechaInicio) : new Date()), // Fallback to new Date if undefined, though schema requires it
        fechaFin: data.fechaFin ? (data.fechaFin instanceof Timestamp ? data.fechaFin.toDate() : new Date(data.fechaFin)) : null,
        costosPorCategoria: (data.costosPorCategoria || []).map((costo: any) => ({
          id: costo.id || `temp-${Math.random().toString(36).substr(2, 9)}`, // Ensure ID exists for schema
          categoria: costo.categoria || '',
          costo: typeof costo.costo === 'number' ? costo.costo : parseFloat(costo.costo || '0'),
          notas: costo.notas || '',
        }))
      };
      const parseResult = ObraSchema.safeParse({ id: docSnap.id, ...obraDataWithDates });
      if (parseResult.success) {
        obras.push(parseResult.data);
      } else {
        console.warn(`Invalid obra data in Firestore for ID ${docSnap.id}:`, parseResult.error.flatten().fieldErrors);
      }
    });
    return obras.sort((a,b) => b.fechaInicio.getTime() - a.fechaInicio.getTime());
  } catch (error) {
    console.error("Error fetching obras by empresaId:", error);
    return [];
  }
}

export async function getObraById(obraId: string, empresaId: string): Promise<Obra | null> {
  try {
    const obraDocRef = doc(db, "obras", obraId);
    const obraDocSnap = await getDoc(obraDocRef);

    if (obraDocSnap.exists() && obraDocSnap.data().empresaId === empresaId) {
      const data = obraDocSnap.data();
      const obraDataWithDates = {
        ...data,
        fechaInicio: data.fechaInicio instanceof Timestamp ? data.fechaInicio.toDate() : (data.fechaInicio ? new Date(data.fechaInicio) : new Date()),
        fechaFin: data.fechaFin ? (data.fechaFin instanceof Timestamp ? data.fechaFin.toDate() : new Date(data.fechaFin)) : null,
         costosPorCategoria: (data.costosPorCategoria || []).map((costo: any) => ({
          id: costo.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          categoria: costo.categoria || '',
          costo: typeof costo.costo === 'number' ? costo.costo : parseFloat(costo.costo || '0'),
          notas: costo.notas || '',
        }))
      };
      const parseResult = ObraSchema.safeParse({ id: obraDocSnap.id, ...obraDataWithDates });
      if (parseResult.success) {
        return parseResult.data;
      } else {
         console.warn(`Invalid obra data in Firestore for ID ${obraId}:`, parseResult.error.flatten().fieldErrors);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching obra by ID:", error);
    return null;
  }
}

export async function createObra(data: CreateObraFormInputDataFirebase, empresaId: string): Promise<{ success: boolean; message: string; obra?: Obra }> {
  const formValidationResult = CreateObraFormInputSchemaFirebase.safeParse(data);
  if (!formValidationResult.success) {
    console.error("Form validation errors:", formValidationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación del formulario: ${JSON.stringify(formValidationResult.error.flatten().fieldErrors)}` };
  }

  const { jefeObraEmail, fechaFinEstimada, ...obraCoreData } = formValidationResult.data;
  let jefeObraIdToAssign: string | undefined = undefined;

  if (jefeObraEmail) {
    const usersRef = collection(db, "usuarios");
    const q = query(usersRef, where("email", "==", jefeObraEmail), where("empresaId", "==", empresaId), where("rol", "==", "jefeObra"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      jefeObraIdToAssign = querySnapshot.docs[0].id;
    } else {
      console.warn(`Jefe de Obra con email ${jefeObraEmail} no encontrado en la empresa ${empresaId} o no tiene el rol correcto.`);
    }
  }
  
  try {
    const newObraRef = doc(collection(db, "obras"));
    const newObraId = newObraRef.id;

    const rawObraToCreate = {
      ...obraCoreData,
      id: newObraId,
      empresaId,
      jefeObraId: jefeObraIdToAssign,
      fechaFin: fechaFinEstimada ? fechaFinEstimada : null, // Ensure it's Date or null
      costosPorCategoria: [], 
    };

    // Validate with the full ObraSchema (omitting server-generated fields) before saving
    const finalObraDataForDb = ObraSchema.omit({dataAIHint: true}).parse({
      ...rawObraToCreate,
      fechaInicio: new Date(rawObraToCreate.fechaInicio), // Ensure Date object
      fechaFin: rawObraToCreate.fechaFin ? new Date(rawObraToCreate.fechaFin) : null, // Ensure Date or null
    });
    
    const firestoreData = {
        ...finalObraDataForDb,
        fechaInicio: Timestamp.fromDate(finalObraDataForDb.fechaInicio),
        fechaFin: finalObraDataForDb.fechaFin ? Timestamp.fromDate(finalObraDataForDb.fechaFin) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }

    await setDoc(newObraRef, firestoreData);

    if (jefeObraIdToAssign) {
      const jefeObraDocRef = doc(db, "usuarios", jefeObraIdToAssign);
      await updateDoc(jefeObraDocRef, {
        obrasAsignadas: arrayUnion(newObraId)
      });
      revalidatePath(`/(app)/usuarios/${jefeObraIdToAssign}/edit`);
      revalidatePath('/(app)/usuarios');
    }

    revalidatePath('/(app)/obras');
    revalidatePath(`/(app)/obras/new`);
    
    const createdObraSnap = await getDoc(newObraRef);
    const createdObraData = createdObraSnap.data();

    if (!createdObraData) {
        throw new Error("Failed to fetch created obra data.");
    }
    
    const obraResult = ObraSchema.parse({ 
        id: createdObraSnap.id, 
        ...createdObraData,
        fechaInicio: (createdObraData.fechaInicio as Timestamp).toDate(),
        fechaFin: createdObraData.fechaFin ? (createdObraData.fechaFin as Timestamp).toDate() : null,
        costosPorCategoria: (createdObraData.costosPorCategoria || []).map((costo: any) => CostoCategoriaSchema.parse(costo))
    });
    
    return { success: true, message: `La obra "${obraResult.nombre}" ha sido creada correctamente.`, obra: obraResult };

  } catch (error: any) {
    console.error("Error creating obra in Firestore:", error);
    if (error instanceof z.ZodError) {
        return { success: false, message: `Error de validación de datos Zod: ${JSON.stringify(error.flatten().fieldErrors)}` };
    }
    return { success: false, message: `Error al crear la obra: ${error.message || 'Error desconocido.'}` };
  }
}

const UpdateObraFirebaseSchema = ObraSchema.partial().pick({
    nombre: true,
    direccion: true,
    clienteNombre: true,
    fechaInicio: true,
    fechaFin: true,
    jefeObraId: true,
    descripcion: true,
    costosPorCategoria: true,
}).extend({
  trabajadoresAsignados: z.array(z.string()).optional(),
});

export async function updateObra(
  obraId: string, 
  empresaId: string, 
  data: Partial<Omit<Obra, 'id' | 'empresaId' | 'dataAIHint'> & { trabajadoresAsignados?: string[] }>
): Promise<{ success: boolean; message: string; obra?: Obra }> {
  
  const obraDocRef = doc(db, "obras", obraId);
  const obraSnap = await getDoc(obraDocRef);

  if (!obraSnap.exists() || obraSnap.data().empresaId !== empresaId) {
    return { success: false, message: 'Obra no encontrada o no pertenece a tu empresa.' };
  }
  const currentObraData = obraSnap.data() as Obra; 

  const validationResult = UpdateObraFirebaseSchema.safeParse(data);
  if (!validationResult.success) {
    console.error("Update validation errors:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación al actualizar: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }
  
  const { trabajadoresAsignados, ...obraCoreData } = validationResult.data;
  
  const dataToUpdate: any = { ...obraCoreData, updatedAt: serverTimestamp() };
  if (dataToUpdate.fechaInicio) dataToUpdate.fechaInicio = Timestamp.fromDate(new Date(dataToUpdate.fechaInicio));
  
  if (data.fechaFin === null) {
    dataToUpdate.fechaFin = null;
  } else if (dataToUpdate.fechaFin) {
    dataToUpdate.fechaFin = Timestamp.fromDate(new Date(dataToUpdate.fechaFin));
  }

  if (dataToUpdate.costosPorCategoria) {
    dataToUpdate.costosPorCategoria = dataToUpdate.costosPorCategoria.map((c: any) => ({
      id: c.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      categoria: c.categoria || '',
      costo: Number(c.costo) || 0,
      notas: c.notas || '',
    }));
  }

  Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

  const batch = writeBatch(db);
  batch.update(obraDocRef, dataToUpdate);

  const oldJefeObraId = currentObraData.jefeObraId;
  const newJefeObraId = data.jefeObraId;

  if (newJefeObraId !== oldJefeObraId) {
    if (oldJefeObraId) {
      const oldJefeRef = doc(db, "usuarios", oldJefeObraId);
      batch.update(oldJefeRef, { obrasAsignadas: arrayRemove(obraId) });
    }
    if (newJefeObraId) {
      const newJefeRef = doc(db, "usuarios", newJefeObraId);
      batch.update(newJefeRef, { obrasAsignadas: arrayUnion(obraId) });
    }
  }

  if (trabajadoresAsignados !== undefined) {
    const allCompanyWorkersSnapshot = await getDocs(query(collection(db, "usuarios"), where("empresaId", "==", empresaId), where("rol", "==", "trabajador")));
    
    allCompanyWorkersSnapshot.docs.forEach(workerDoc => {
      const workerId = workerDoc.id;
      const currentAssignments = (workerDoc.data().obrasAsignadas as string[] | undefined) || [];
      const isCurrentlyAssignedToThisObra = currentAssignments.includes(obraId);
      const shouldBeAssignedToThisObra = trabajadoresAsignados.includes(workerId);

      if (shouldBeAssignedToThisObra && !isCurrentlyAssignedToThisObra) {
        batch.update(workerDoc.ref, { obrasAsignadas: arrayUnion(obraId) });
      } else if (!shouldBeAssignedToThisObra && isCurrentlyAssignedToThisObra) {
        batch.update(workerDoc.ref, { obrasAsignadas: arrayRemove(obraId) });
      }
    });
  }
  
  try {
    await batch.commit();

    const updatedObraSnap = await getDoc(obraDocRef);
    const updatedData = updatedObraSnap.data();
     if (!updatedData) {
        throw new Error("Failed to fetch updated obra data.");
    }
    
    const obraResult = ObraSchema.parse({ 
        id: updatedObraSnap.id, 
        ...updatedData,
        fechaInicio: (updatedData.fechaInicio as Timestamp).toDate(),
        fechaFin: updatedData.fechaFin ? (updatedData.fechaFin as Timestamp).toDate() : null,
        costosPorCategoria: (updatedData.costosPorCategoria || []).map((costo: any) => CostoCategoriaSchema.parse(costo))
    });

    revalidatePath('/(app)/obras');
    revalidatePath(`/(app)/obras/${obraId}`); 
    revalidatePath(`/(app)/obras/${obraId}/edit`);
    if (trabajadoresAsignados !== undefined || newJefeObraId !== oldJefeObraId) {
      revalidatePath('/(app)/usuarios');
    }
    
    return { success: true, message: `La obra "${obraResult.nombre}" ha sido actualizada.`, obra: obraResult };
  } catch (error: any) {
    console.error("Error updating obra in Firestore:", error);
    if (error instanceof z.ZodError) {
        return { success: false, message: `Error de validación de datos Zod: ${JSON.stringify(error.flatten().fieldErrors)}` };
    }
    return { success: false, message: `Error al actualizar la obra: ${error.message || 'Error desconocido.'}` };
  }
}

export async function deleteObra(obraId: string, empresaId: string): Promise<{ success: boolean; message: string }> {
  const obraDocRef = doc(db, "obras", obraId);
  const obraSnap = await getDoc(obraDocRef);

  if (!obraSnap.exists() || obraSnap.data().empresaId !== empresaId) {
    return { success: false, message: 'Obra no encontrada o no pertenece a tu empresa para eliminar.' };
  }
  const obraNombre = obraSnap.data().nombre;
  
  try {
    const batch = writeBatch(db);

    const usersQuery = query(collection(db, "usuarios"), where("empresaId", "==", empresaId), where("obrasAsignadas", "array-contains", obraId));
    const usersSnap = await getDocs(usersQuery);
    usersSnap.forEach(userDoc => {
      batch.update(userDoc.ref, { obrasAsignadas: arrayRemove(obraId) });
    });
    
    // TODO: Consider deleting related 'partes', 'fichajes', 'controlDiario' or marking them as archived.
    // For now, just deletes the obra and unassigns users.

    batch.delete(obraDocRef);
    await batch.commit();
  
    revalidatePath('/(app)/obras');
    revalidatePath('/(app)/usuarios'); 
    
    return { success: true, message: `Obra "${obraNombre}" eliminada con éxito.` };
  } catch (error: any) {
    console.error("Error deleting obra:", error);
    return { success: false, message: `Error al eliminar la obra: ${error.message || 'Error desconocido.'}` };
  }
}

