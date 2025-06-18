
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EmpresaSchema, type Empresa, UsuarioFirebaseSchema, type UsuarioFirebase } from '@/lib/types';
import { db, auth } from '@/lib/firebase/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const RegisterEmpresaFormSchema = z.object({
  empresaNombre: z.string().min(2),
  empresaCIF: z.string().min(9).regex(/^[A-HJ-NP-SUVW]{1}[0-9]{7}[0-9A-J]{1}$/i),
  empresaEmailContacto: z.string().email(),
  empresaTelefono: z.string().min(9),
  adminNombre: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
  adminDNI: z.string().min(9).regex(/^[0-9XYZxyz][0-9]{7}[A-HJ-NP-TV-Z]$/i),
});
type RegisterEmpresaFormData = z.infer<typeof RegisterEmpresaFormSchema>;

export async function createEmpresaWithAdmin(data: RegisterEmpresaFormData): Promise<{ success: boolean; message: string; empresa?: Empresa; adminUser?: Omit<UsuarioFirebase, 'password'> }> {
  try {
    const validationResult = RegisterEmpresaFormSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
    }
    const { 
      empresaNombre, empresaCIF, empresaEmailContacto, empresaTelefono,
      adminNombre, adminEmail, adminPassword, adminDNI 
    } = validationResult.data;

    const empresaCifQuery = query(collection(db, "empresas"), where("CIF", "==", empresaCIF));
    const empresaCifSnapshot = await getDocs(empresaCifQuery);
    if (!empresaCifSnapshot.empty) {
      return { success: false, message: 'Ya existe una empresa registrada con este CIF.' };
    }
    
     try {
        const q = query(collection(db, "usuarios"), where("email", "==", adminEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, message: 'Este email de administrador ya está en uso.' };
        }
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') { // Should be caught by the query above mostly
             return { success: false, message: 'Este email de administrador ya está registrado en el sistema.' };
        }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;

    const newEmpresaRef = doc(collection(db, "empresas"));
    const newEmpresaId = newEmpresaRef.id;
    
    const rawEmpresaData = {
      id: newEmpresaId,
      nombre: empresaNombre,
      CIF: empresaCIF,
      emailContacto: empresaEmailContacto,
      telefono: empresaTelefono,
      logoURL: null,
    };
    // Validate before saving
    const empresaDataToStore = EmpresaSchema.parse(rawEmpresaData);
    await setDoc(newEmpresaRef, { ...empresaDataToStore, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

    const rawAdminUserData = {
      id: adminUid,
      empresaId: newEmpresaId,
      nombre: adminNombre,
      email: adminEmail,
      password: adminPassword, // For schema validation, not stored
      dni: adminDNI,
      rol: 'admin' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    // Validate before saving, omit password for storage
    const adminUserDataToStore = UsuarioFirebaseSchema.omit({password: true}).parse(rawAdminUserData);
    await setDoc(doc(db, "usuarios", adminUid), { ...adminUserDataToStore, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

    revalidatePath('/auth/login/empresa');
    return { success: true, message: 'Empresa y administrador creados con éxito.', empresa: empresaDataToStore, adminUser: adminUserDataToStore };

  } catch (error: any) {
    console.error("Error creating empresa with admin:", error);
    let message = 'Error al crear la empresa.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'El email proporcionado para el administrador ya está en uso.';
    } else if (error.code === 'auth/weak-password') {
      message = 'La contraseña proporcionada es demasiado débil.';
    } else if (error instanceof z.ZodError) {
      message = `Error de validación de datos internos: ${JSON.stringify(error.flatten().fieldErrors)}`;
    }
    return { success: false, message };
  }
}


export async function getEmpresaProfile(id: string): Promise<Empresa | null> {
  try {
    const empresaRef = doc(db, "empresas", id);
    const empresaSnap = await getDoc(empresaRef);

    if (empresaSnap.exists()) {
      // Ensure createdAt and updatedAt are either valid dates or excluded if not part of Empresa schema
      const data = empresaSnap.data();
      const dataToParse = {
        id: empresaSnap.id,
        nombre: data.nombre,
        CIF: data.CIF,
        emailContacto: data.emailContacto,
        telefono: data.telefono,
        logoURL: data.logoURL,
        // dataAIHint is optional and might not be present
        ...(data.dataAIHint && { dataAIHint: data.dataAIHint }), 
      };
      return EmpresaSchema.parse(dataToParse);
    }
    return null;
  } catch (error) {
    console.error("Error fetching empresa profile:", error);
    return null;
  }
}

const UpdateEmpresaSchemaInternal = EmpresaSchema.partial().omit({ id: true, CIF: true }); 

export async function updateEmpresaProfile(id: string, data: Partial<Omit<Empresa, 'id' | 'CIF'>>): Promise<{ success: boolean; message: string; empresa?: Empresa }> {
  try {
    const empresaRef = doc(db, "empresas", id);
    const currentEmpresaSnap = await getDoc(empresaRef);
    if (!currentEmpresaSnap.exists()) {
      return { success: false, message: 'Empresa no encontrada.' };
    }

    const validationResult = UpdateEmpresaSchemaInternal.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const errorMessages = Object.values(errors).flat().join(', ');
      return { success: false, message: `Error de validación: ${errorMessages}` };
    }
    
    const dataToUpdate = { ...validationResult.data, updatedAt: serverTimestamp()};
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);

    await updateDoc(empresaRef, dataToUpdate);
    
    const updatedEmpresaSnap = await getDoc(empresaRef);
    const updatedEmpresaData = updatedEmpresaSnap.data();
    if (!updatedEmpresaData) { // Should not happen if updateDoc succeeded and doc existed
        return { success: false, message: "Error: No se encontraron datos de la empresa después de actualizar." };
    }
    const dataToParse = { // Reconstruct for parsing, handling potential missing optional fields
        id: updatedEmpresaSnap.id,
        nombre: updatedEmpresaData.nombre,
        CIF: updatedEmpresaData.CIF,
        emailContacto: updatedEmpresaData.emailContacto,
        telefono: updatedEmpresaData.telefono,
        logoURL: updatedEmpresaData.logoURL,
        ...(updatedEmpresaData.dataAIHint && { dataAIHint: updatedEmpresaData.dataAIHint }),
    };
    const updatedEmpresa = EmpresaSchema.parse(dataToParse);

    revalidatePath('/(app)/company-profile');
    return { success: true, message: 'Perfil de empresa actualizado con éxito.', empresa: updatedEmpresa };

  } catch (error) {
    console.error("Error updating empresa profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió.";
    return { success: false, message: `Error al actualizar el perfil: ${errorMessage}` };
  }
}
