
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EmpresaSchema, type Empresa, UsuarioFirebaseSchema } from '@/lib/types';
import { db, auth } from '@/lib/firebase/firebase'; // Import Firestore instance
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

export async function createEmpresaWithAdmin(data: RegisterEmpresaFormData): Promise<{ success: boolean; message: string; empresa?: Empresa; adminUser?: UsuarioFirebase }> {
  try {
    const validationResult = RegisterEmpresaFormSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
    }
    const { 
      empresaNombre, empresaCIF, empresaEmailContacto, empresaTelefono,
      adminNombre, adminEmail, adminPassword, adminDNI 
    } = validationResult.data;

    // Check if company CIF already exists
    const empresaCifQuery = query(collection(db, "empresas"), where("CIF", "==", empresaCIF));
    const empresaCifSnapshot = await getDocs(empresaCifQuery);
    if (!empresaCifSnapshot.empty) {
      return { success: false, message: 'Ya existe una empresa registrada con este CIF.' };
    }
    
    // Check if admin email already exists in Firebase Auth (implicitly checks users collection too if email is unique there)
     try {
        const q = query(collection(db, "usuarios"), where("email", "==", adminEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, message: 'Este email de administrador ya está en uso.' };
        }
    } catch (e: any) {
        // This is to catch potential Firebase Auth errors if the email is already in use by Auth but not Firestore
        // (should ideally not happen if data is consistent)
        if (e.code === 'auth/email-already-in-use') {
             return { success: false, message: 'Este email de administrador ya está registrado en el sistema.' };
        }
    }


    // 1. Create Firebase Auth user for the admin
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;

    // 2. Create Empresa document in Firestore
    const newEmpresaRef = doc(collection(db, "empresas"));
    const newEmpresaId = newEmpresaRef.id;
    const empresaData: Empresa = {
      id: newEmpresaId,
      nombre: empresaNombre,
      CIF: empresaCIF,
      emailContacto: empresaEmailContacto,
      telefono: empresaTelefono,
      logoURL: null, // Can be updated later
    };
    await setDoc(newEmpresaRef, { ...empresaData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

    // 3. Create Admin User document in Firestore
    const adminUserData: UsuarioFirebase = {
      id: adminUid,
      empresaId: newEmpresaId,
      nombre: adminNombre,
      email: adminEmail,
      password: '', // Don't store password in Firestore
      dni: adminDNI,
      rol: 'admin',
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    await setDoc(doc(db, "usuarios", adminUid), { ...adminUserData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

    revalidatePath('/auth/login/empresa');
    return { success: true, message: 'Empresa y administrador creados con éxito.', empresa: empresaData, adminUser: adminUserData };

  } catch (error: any) {
    console.error("Error creating empresa with admin:", error);
    let message = 'Error al crear la empresa.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'El email proporcionado para el administrador ya está en uso.';
    } else if (error.code === 'auth/weak-password') {
      message = 'La contraseña proporcionada es demasiado débil.';
    }
    return { success: false, message };
  }
}


export async function getEmpresaProfile(id: string): Promise<Empresa | null> {
  try {
    const empresaRef = doc(db, "empresas", id);
    const empresaSnap = await getDoc(empresaRef);

    if (empresaSnap.exists()) {
      return EmpresaSchema.parse({ id: empresaSnap.id, ...empresaSnap.data() });
    }
    return null;
  } catch (error) {
    console.error("Error fetching empresa profile:", error);
    return null;
  }
}

const UpdateEmpresaSchemaInternal = EmpresaSchema.partial().omit({ id: true, CIF: true }); // CIF should not be updatable usually

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
    // Remove undefined fields from dataToUpdate to avoid overwriting with undefined
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);


    await updateDoc(empresaRef, dataToUpdate);
    
    const updatedEmpresaSnap = await getDoc(empresaRef);
    const updatedEmpresa = EmpresaSchema.parse({ id: updatedEmpresaSnap.id, ...updatedEmpresaSnap.data() });

    revalidatePath('/(app)/company-profile');
    return { success: true, message: 'Perfil de empresa actualizado con éxito.', empresa: updatedEmpresa };

  } catch (error) {
    console.error("Error updating empresa profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Un error desconocido ocurrió.";
    return { success: false, message: `Error al actualizar el perfil: ${errorMessage}` };
  }
}
