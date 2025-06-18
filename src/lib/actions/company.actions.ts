
// src/lib/actions/company.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EmpresaSchema, type Empresa, UsuarioFirebaseSchema, type UsuarioFirebase } from '@/lib/types';
import { db, auth } from '@/lib/firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const RegisterEmpresaFormSchema = z.object({
  empresaNombre: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres." }),
  empresaCIF: z.string().min(9, { message: "El CIF debe tener al menos 9 caracteres." }).regex(/^[A-HJ-NP-SUVW]{1}[0-9]{7}[0-9A-J]{1}$/i, "Formato de CIF inválido."),
  empresaEmailContacto: z.string().email({ message: "Email de contacto de la empresa inválido." }),
  empresaTelefono: z.string().min(9, { message: "El teléfono de la empresa debe tener al menos 9 dígitos." }),
  adminNombre: z.string().min(2, { message: "Tu nombre debe tener al menos 2 caracteres." }),
  adminEmail: z.string().email({ message: "Tu email de administrador es inválido." }),
  adminPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  adminDNI: z.string().min(9, "El DNI es requerido").regex(/^[0-9XYZxyz][0-9]{7}[A-HJ-NP-TV-Z]$/i, "Formato de DNI/NIE inválido"),
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

    const cifUpperCase = empresaCIF.toUpperCase();

    const empresaCifQuery = query(collection(db, "empresas"), where("CIF", "==", cifUpperCase));
    const empresaCifSnapshot = await getDocs(empresaCifQuery);
    if (!empresaCifSnapshot.empty) {
      return { success: false, message: 'Ya existe una empresa registrada con este CIF.' };
    }

    const adminEmailDbQuery = query(collection(db, "usuarios"), where("email", "==", adminEmail));
    const adminEmailDbSnapshot = await getDocs(adminEmailDbQuery);
    if (!adminEmailDbSnapshot.empty) {
        return { success: false, message: 'Este email de administrador ya está en uso en la base de datos de usuarios.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;

    const newEmpresaRef = doc(collection(db, "empresas"));
    const newEmpresaId = newEmpresaRef.id;

    const rawEmpresaData = {
      id: newEmpresaId,
      nombre: empresaNombre,
      CIF: cifUpperCase,
      emailContacto: empresaEmailContacto,
      telefono: empresaTelefono,
      logoURL: null, // Explicitly set to null
      dataAIHint: undefined, // Let Zod handle optional field
    };
    const empresaDataToStore = EmpresaSchema.parse(rawEmpresaData);
    await setDoc(newEmpresaRef, { ...empresaDataToStore, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });


    const rawAdminUserData = {
      id: adminUid,
      empresaId: newEmpresaId,
      nombre: adminNombre,
      email: adminEmail,
      dni: adminDNI,
      rol: 'admin' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: null, // Explicitly set to null
      dniReversoURL: null, // Explicitly set to null
      // password is not stored in Firestore
    };
    const adminUserDataToStore = UsuarioFirebaseSchema.omit({password: true}).parse(rawAdminUserData);
    await setDoc(doc(db, "usuarios", adminUid), { ...adminUserDataToStore, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

    revalidatePath('/auth/login/empresa');
    return { success: true, message: 'Empresa y administrador creados con éxito.', empresa: empresaDataToStore, adminUser: adminUserDataToStore };

  } catch (error: any) {
    console.error("--- CreateEmpresaAdmin Action FAILED ---");
    console.error("Error Type:", Object.prototype.toString.call(error));
    if (error.name) console.error("Error Name:", error.name);
    if (error.message) console.error("Error Message:", error.message);
    if (error.code) console.error("Error Code (Firebase):", error.code);
    if (error.stack) console.error("Error Stack:", error.stack);
    try {
      const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error));
      console.error("Full Error (stringified):", errorDetails);
    } catch (e) {
      console.error("Could not stringify the full error object.");
    }

    let userMessage = 'Error desconocido al registrar la empresa. Contacta a soporte si el problema persiste.';

    if (error instanceof z.ZodError) {
      userMessage = `Error de validación de datos Zod: ${JSON.stringify(error.flatten().fieldErrors)}`;
    } else if (error.code) { // Firebase errors often have a 'code' property
      switch (error.code) {
        case 'auth/email-already-in-use':
          userMessage = 'El email proporcionado para el administrador ya está registrado en Firebase Authentication.';
          break;
        case 'auth/weak-password':
          userMessage = 'La contraseña proporcionada es demasiado débil (mínimo 6 caracteres).';
          break;
        case 'permission-denied':
        case 'firestore/permission-denied':
          userMessage = 'Error de permisos con Firestore. Verifica las reglas de seguridad de Firestore. Es posible que la operación esté tardando demasiado debido a reglas complejas.';
          break;
        default:
          userMessage = error.message ? `Error de Firebase: ${error.message} (Código: ${error.code})` : `Error de Firebase (Código: ${error.code})`;
      }
    } else if (typeof error.message === 'string' && error.message.trim() !== '') {
        userMessage = error.message;
    }

    if (typeof userMessage !== 'string') {
        userMessage = "Ocurrió un error inesperado durante el registro.";
    }
    
    console.error("User-facing error message to be returned:", userMessage);
    return { success: false, message: userMessage };
  }
}


export async function getEmpresaProfile(id: string): Promise<Empresa | null> {
  try {
    const empresaRef = doc(db, "empresas", id);
    const empresaSnap = await getDoc(empresaRef);

    if (empresaSnap.exists()) {
      const data = empresaSnap.data();
      const dataToParse = {
        id: empresaSnap.id,
        nombre: data.nombre,
        CIF: data.CIF,
        emailContacto: data.emailContacto,
        telefono: data.telefono,
        logoURL: data.logoURL, // Will be null if not set or explicitly null
        dataAIHint: data.dataAIHint,
      };
      const parseResult = EmpresaSchema.safeParse(dataToParse);
      if (parseResult.success) {
        return parseResult.data;
      } else {
        console.warn(`Invalid empresa data in Firestore for ID ${id}:`, parseResult.error.flatten().fieldErrors);
        return null;
      }
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

    const dataToUpdate: Record<string, any> = { ...validationResult.data, updatedAt: serverTimestamp()};
    // Ensure explicitly null values are passed for fields intended to be cleared
    if (data.hasOwnProperty('logoURL')) {
        dataToUpdate.logoURL = data.logoURL === '' ? null : data.logoURL;
    }
    // Remove undefined keys to avoid issues with Firestore update
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);


    await updateDoc(empresaRef, dataToUpdate);

    const updatedEmpresaSnap = await getDoc(empresaRef);
    const updatedEmpresaData = updatedEmpresaSnap.data();
    if (!updatedEmpresaData) {
        return { success: false, message: "Error: No se encontraron datos de la empresa después de actualizar." };
    }
    const dataToParse = {
        id: updatedEmpresaSnap.id,
        nombre: updatedEmpresaData.nombre,
        CIF: updatedEmpresaData.CIF,
        emailContacto: updatedEmpresaData.emailContacto,
        telefono: updatedEmpresaData.telefono,
        logoURL: updatedEmpresaData.logoURL,
        dataAIHint: updatedEmpresaData.dataAIHint,
    };
    const parseResult = EmpresaSchema.safeParse(dataToParse);
    if (!parseResult.success) {
        console.warn(`Error parsing updated Empresa data for ID ${id}:`, parseResult.error.flatten().fieldErrors);
        return { success: false, message: "Error al procesar los datos actualizados de la empresa." };
    }
    const updatedEmpresa = parseResult.data;

    revalidatePath('/(app)/company-profile');
    return { success: true, message: 'Perfil de empresa actualizado con éxito.', empresa: updatedEmpresa };

  } catch (error: any) {
    console.error("Error updating empresa profile:", error);
    let userMessage = "Un error desconocido ocurrió al actualizar el perfil.";
    if (typeof error.message === 'string' && error.message.trim() !== '') {
        userMessage = error.message;
    } else if (typeof error.toString === 'function') {
        const errorString = error.toString();
        userMessage = errorString.replace(/^Error: /, '').trim() !== '' ? errorString : userMessage;
    }
    return { success: false, message: `Error al actualizar el perfil: ${userMessage}` };
  }
}
