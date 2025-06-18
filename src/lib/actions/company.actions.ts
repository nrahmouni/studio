
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
  console.log("createEmpresaWithAdmin action started with data:", JSON.stringify(data, null, 2));
  const validationResult = RegisterEmpresaFormSchema.safeParse(data);
  if (!validationResult.success) {
    const errorDetails = JSON.stringify(validationResult.error.flatten().fieldErrors);
    console.error("Server-side validation errors:", errorDetails);
    return { success: false, message: `Error de validación del servidor: ${errorDetails}` };
  }
  const {
    empresaNombre, empresaCIF, empresaEmailContacto, empresaTelefono,
    adminNombre, adminEmail, adminPassword, adminDNI
  } = validationResult.data;

  const cifUpperCase = empresaCIF.toUpperCase();

  try {
    console.log("[STEP 1] Checking for existing empresa CIF:", cifUpperCase);
    const empresaCifQuery = query(collection(db, "empresas"), where("CIF", "==", cifUpperCase));
    const empresaCifSnapshot = await getDocs(empresaCifQuery);
    if (!empresaCifSnapshot.empty) {
      console.log("Empresa with this CIF already exists.");
      return { success: false, message: 'Ya existe una empresa registrada con este CIF.' };
    }
    console.log("[STEP 1] CIF check passed.");

    console.log("[STEP 2] Checking for existing admin email in 'usuarios':", adminEmail);
    const adminEmailDbQuery = query(collection(db, "usuarios"), where("email", "==", adminEmail));
    const adminEmailDbSnapshot = await getDocs(adminEmailDbQuery);
    if (!adminEmailDbSnapshot.empty) {
        console.log("Admin email already in use in 'usuarios' collection.");
        return { success: false, message: 'Este email de administrador ya está en uso en la base de datos de usuarios.' };
    }
    console.log("[STEP 2] Admin email check passed.");

    console.log("[STEP 3] Attempting to create Firebase Auth user for:", adminEmail);
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;
    console.log("[STEP 3] Firebase Auth user created successfully. UID:", adminUid);

    const newEmpresaRef = doc(collection(db, "empresas"));
    const newEmpresaId = newEmpresaRef.id;

    const rawEmpresaData = {
      id: newEmpresaId,
      nombre: empresaNombre,
      CIF: cifUpperCase,
      emailContacto: empresaEmailContacto,
      telefono: empresaTelefono,
      logoURL: null,
      // dataAIHint is optional and not provided in the form, so it's omitted.
    };
    const empresaDataToStore = EmpresaSchema.parse(rawEmpresaData);
    console.log("[STEP 4] Attempting to setDoc for new empresa:", newEmpresaId);
    await setDoc(newEmpresaRef, { ...empresaDataToStore, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    console.log("[STEP 4] New empresa document created successfully.");

    const rawAdminUserData = {
      id: adminUid,
      empresaId: newEmpresaId,
      nombre: adminNombre,
      email: adminEmail,
      dni: adminDNI,
      rol: 'admin' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    const adminUserDataToStore = UsuarioFirebaseSchema.omit({password: true}).parse(rawAdminUserData);
    console.log("[STEP 5] Attempting to setDoc for new admin user:", adminUid);
    await setDoc(doc(db, "usuarios", adminUid), { ...adminUserDataToStore, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    console.log("[STEP 5] New admin user document created successfully.");

    console.log("[STEP 6] Revalidating paths and returning success.");
    revalidatePath('/auth/login/empresa');
    return { success: true, message: 'Empresa y administrador creados con éxito.', empresa: empresaDataToStore, adminUser: adminUserDataToStore };

  } catch (error: any) {
    console.error("--- CreateEmpresaAdmin Action FAILED ---");
    let userMessage = 'Error desconocido al registrar la empresa. Contacta a soporte si el problema persiste.';
    let errorCode = 'UNKNOWN_ERROR_IN_CATCH';

    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.code) console.error("Error Code (Firebase/etc.):", error.code);
    if (error.stack) console.error("Error Stack:", error.stack);
    
    try {
        const errorDetailsString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error("Full Error (stringified):", errorDetailsString);
    } catch (stringifyError: any) {
        console.error("Could not stringify the full error object:", stringifyError.message);
    }

    if (error instanceof z.ZodError) {
      userMessage = `Error de validación de datos Zod: ${JSON.stringify(error.flatten().fieldErrors)}`;
      errorCode = 'ZOD_VALIDATION_ERROR';
    } else if (error && typeof error.code === 'string') {
      errorCode = error.code;
      switch (error.code) {
        case 'auth/email-already-in-use':
          userMessage = 'El email proporcionado para el administrador ya está registrado en Firebase Authentication.';
          break;
        case 'auth/weak-password':
          userMessage = 'La contraseña proporcionada es demasiado débil (mínimo 6 caracteres).';
          break;
        case 'firestore/permission-denied':
        case 'permission-denied':
          userMessage = 'Error de permisos con Firestore. Verifica las reglas de seguridad. Esto también puede ocurrir si la operación excede los límites de tiempo.';
          break;
        case 'invalid-argument':
           userMessage = `Error de Firebase: ${error.message || 'Argumento inválido al intentar guardar datos.'} (Código: ${error.code})`;
           break;
        default:
          userMessage = error.message ? `Error de Firebase: ${error.message} (Código: ${error.code})` : `Error de Firebase (Código: ${error.code})`;
      }
    } else if (error && typeof error.message === 'string' && error.message.trim() !== '') {
        userMessage = error.message;
        errorCode = 'GENERAL_ERROR_WITH_MESSAGE';
    }
    
    if (typeof userMessage !== 'string' || userMessage.trim() === '') {
        userMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde (desde catch).';
    }
    
    console.error("Final userMessage to be returned to client:", userMessage);
    console.error("Final errorCode determined for server logs:", errorCode);
    console.log("About to return from catch block in createEmpresaWithAdmin.");
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
        logoURL: data.logoURL === undefined ? null : data.logoURL, // Ensure null if undefined
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
    
    if (data.hasOwnProperty('logoURL')) {
        dataToUpdate.logoURL = data.logoURL === '' || data.logoURL === undefined ? null : data.logoURL;
    }
    
    if (data.hasOwnProperty('dataAIHint')) {
        if (data.dataAIHint === undefined || data.dataAIHint === '') {
            // If we want to remove it explicitly: dataToUpdate.dataAIHint = FieldValue.delete();
            // For now, just don't set it if it's undefined/empty
            delete dataToUpdate.dataAIHint;
        } else {
            dataToUpdate.dataAIHint = data.dataAIHint;
        }
    }

    Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined) {
            delete dataToUpdate[key];
        }
    });


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
        logoURL: updatedEmpresaData.logoURL === undefined ? null : updatedEmpresaData.logoURL,
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
    
    

    