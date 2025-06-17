
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FichajeSchema, type Fichaje, type FichajeTipo, GetFichajesCriteriaSchema, type GetFichajesCriteria } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import {
  doc,
  addDoc,
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


const CreateFichajeDataSchemaFirebase = z.object({
  usuarioId: z.string(),
  obraId: z.string(),
  tipo: FichajeSchema.shape.tipo,
});
type CreateFichajeDataFirebase = z.infer<typeof CreateFichajeDataSchemaFirebase>;

export async function createFichaje(data: CreateFichajeDataFirebase): Promise<{ success: boolean; message: string; fichaje?: Fichaje }> {
  const validationResult = CreateFichajeDataSchemaFirebase.safeParse(data);
  if (!validationResult.success) {
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const { usuarioId, obraId, tipo } = validationResult.data;

  try {
    const usuarioDocRef = doc(db, "usuarios", usuarioId);
    const obraDocRef = doc(db, "obras", obraId);
    const [usuarioSnap, obraSnap] = await Promise.all([getDoc(usuarioDocRef), getDoc(obraDocRef)]);

    if (!usuarioSnap.exists()) return { success: false, message: 'Usuario no encontrado.' };
    if (!obraSnap.exists()) return { success: false, message: 'Obra no encontrada.' };
    if (usuarioSnap.data().empresaId !== obraSnap.data().empresaId) {
        return { success: false, message: 'El usuario no pertenece a la empresa de la obra.'};
    }
    
    const newFichajeRef = doc(collection(db, "fichajes"));
    const newFichajeId = newFichajeRef.id;

    const newFichajeData = {
      id: newFichajeId,
      usuarioId,
      obraId,
      tipo,
      timestamp: serverTimestamp(), 
      validado: false, 
      validadoPor: null,
    };
    
    // Validate with full schema before saving
    const finalFichajeDataForDb = FichajeSchema.parse(newFichajeData);
    await setDoc(newFichajeRef, finalFichajeDataForDb);
    
    // Fetch the created fichaje to return it with server-generated timestamps resolved
    const createdFichajeSnap = await getDoc(newFichajeRef);
    const createdData = createdFichajeSnap.data();
    const fichajeResult = FichajeSchema.parse({
        id: createdFichajeSnap.id,
        ...createdData,
        timestamp: (createdData?.timestamp as Timestamp).toDate(),
    });


    revalidatePath('/(app)/fichajes'); 
    return { success: true, message: `Fichaje de ${tipo} registrado.`, fichaje: fichajeResult };

  } catch (error: any) {
    console.error("Error creating fichaje:", error);
    return { success: false, message: `Error al registrar el fichaje: ${error.message || "Error desconocido."}` };
  }
}

export async function getFichajesHoyUsuarioObra(usuarioId: string, obraId: string): Promise<Fichaje[]> {
  try {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);

    const q = query(
      collection(db, "fichajes"),
      where("usuarioId", "==", usuarioId),
      where("obraId", "==", obraId),
      where("timestamp", ">=", Timestamp.fromDate(inicioHoy)),
      where("timestamp", "<=", Timestamp.fromDate(finHoy)),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    const fichajes: Fichaje[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const fichajeDataWithDate = { ...data, timestamp: (data.timestamp as Timestamp).toDate() };
      const parseResult = FichajeSchema.safeParse({ id: docSnap.id, ...fichajeDataWithDate });
      if (parseResult.success) {
        fichajes.push(parseResult.data);
      } else {
        console.warn(`Invalid fichaje data for ID ${docSnap.id}:`, parseResult.error);
      }
    });
    return fichajes;
  } catch (error) {
    console.error("Error fetching fichajes hoy usuario obra:", error);
    return [];
  }
}

export async function getFichajesByCriteria(criteria: GetFichajesCriteria): Promise<Fichaje[]> {
  const validationResult = GetFichajesCriteriaSchema.safeParse(criteria);
  if (!validationResult.success) {
    console.error("Error de validación de criterios de fichaje:", validationResult.error.flatten().fieldErrors);
    return [];
  }
  const { empresaId, obraId: obraIdFiltro, usuarioId: usuarioIdFiltro, fechaInicio, fechaFin, estadoValidacion } = validationResult.data;

  try {
    let fichajesQuery = query(collection(db, "fichajes"));

    // First, filter by obras belonging to the empresaId
    const obrasEmpresaRef = collection(db, "obras");
    const obrasEmpresaQuery = query(obrasEmpresaRef, where("empresaId", "==", empresaId));
    const obrasEmpresaSnap = await getDocs(obrasEmpresaQuery);
    const obraIdsDeEmpresa = obrasEmpresaSnap.docs.map(doc => doc.id);

    if (obraIdsDeEmpresa.length === 0) return []; // No obras for this company

    let targetObraIds = obraIdsDeEmpresa;
    if (obraIdFiltro) {
      if (!obraIdsDeEmpresa.includes(obraIdFiltro)) return []; // obraIdFiltro not in company's obras
      targetObraIds = [obraIdFiltro];
    }
    
    // Firestore 'in' query limit is 30.
     if (targetObraIds.length > 30) {
        console.warn("Querying fichajes for more than 30 obras, this might fail or be slow. Consider pagination or alternative query strategy.");
        fichajesQuery = query(fichajesQuery, where("obraId", "in", targetObraIds.slice(0,30)));
    } else if (targetObraIds.length > 0) {
        fichajesQuery = query(fichajesQuery, where("obraId", "in", targetObraIds));
    } else { // Should not happen if obraIdsDeEmpresa had items and obraIdFiltro was valid or undefined
        return [];
    }


    if (usuarioIdFiltro) {
      fichajesQuery = query(fichajesQuery, where("usuarioId", "==", usuarioIdFiltro));
    }
    if (fechaInicio) {
      fichajesQuery = query(fichajesQuery, where("timestamp", ">=", Timestamp.fromDate(new Date(fechaInicio))));
    }
    if (fechaFin) {
      const endOfDay = new Date(fechaFin);
      endOfDay.setHours(23, 59, 59, 999);
      fichajesQuery = query(fichajesQuery, where("timestamp", "<=", Timestamp.fromDate(endOfDay)));
    }
    if (estadoValidacion === 'validados') {
      fichajesQuery = query(fichajesQuery, where("validado", "==", true));
    } else if (estadoValidacion === 'pendientes') {
      fichajesQuery = query(fichajesQuery, where("validado", "==", false));
    }
    
    fichajesQuery = query(fichajesQuery, orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(fichajesQuery);
    const fichajes: Fichaje[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const fichajeDataWithDate = { ...data, timestamp: (data.timestamp as Timestamp).toDate() };
      const parseResult = FichajeSchema.safeParse({ id: docSnap.id, ...fichajeDataWithDate });
      if (parseResult.success) {
        fichajes.push(parseResult.data);
      } else {
        console.warn(`Invalid fichaje data for ID ${docSnap.id}:`, parseResult.error);
      }
    });
    return fichajes;
  } catch (error) {
    console.error("Error fetching fichajes by criteria:", error);
    return [];
  }
}


export async function validateFichaje(fichajeId: string, validadorId: string, empresaIdDelValidador: string): Promise<{ success: boolean; message: string; fichaje?: Fichaje }> {
  try {
    const fichajeDocRef = doc(db, "fichajes", fichajeId);
    const fichajeSnap = await getDoc(fichajeDocRef);

    if (!fichajeSnap.exists()) {
      return { success: false, message: 'Fichaje no encontrado.' };
    }
    const fichajeData = fichajeSnap.data();

    const validadorDocRef = doc(db, "usuarios", validadorId);
    const validadorSnap = await getDoc(validadorDocRef);
    if (!validadorSnap.exists() || (validadorSnap.data().rol !== 'admin' && validadorSnap.data().rol !== 'jefeObra') || validadorSnap.data().empresaId !== empresaIdDelValidador) {
      return { success: false, message: 'Usuario validador no encontrado, no autorizado o no pertenece a la empresa.' };
    }

    const obraDocRef = doc(db, "obras", fichajeData.obraId);
    const obraSnap = await getDoc(obraDocRef);
    if (!obraSnap.exists() || obraSnap.data().empresaId !== empresaIdDelValidador) {
      return { success: false, message: 'El fichaje no pertenece a una obra de la empresa del validador.' };
    }

    await updateDoc(fichajeDocRef, {
      validado: true,
      validadoPor: validadorId,
      updatedAt: serverTimestamp() 
    });
    
    const updatedFichajeSnap = await getDoc(fichajeDocRef);
    const updatedData = updatedFichajeSnap.data();
    const fichajeResult = FichajeSchema.parse({
        id: updatedFichajeSnap.id,
        ...updatedData,
        timestamp: (updatedData?.timestamp as Timestamp).toDate(),
    });


    revalidatePath('/(app)/fichajes');
    return { success: true, message: 'Fichaje validado con éxito.', fichaje: fichajeResult };
  } catch (error: any) {
    console.error("Error validating fichaje:", error);
    return { success: false, message: `Error al validar el fichaje: ${error.message || "Error desconocido."}` };
  }
}
