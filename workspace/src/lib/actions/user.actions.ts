
// src/lib/actions/user.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { UsuarioFirebaseSchema, type UsuarioFirebase } from '@/lib/types';
import { db, auth } from '@/lib/firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, writeBatch, deleteDoc } from 'firebase/firestore';

const LoginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Contraseña requerida.'),
});

export async function authenticateUser(
  credentials: z.infer<typeof LoginSchema>,
  allowedRoles: Array<UsuarioFirebase['rol']>
): Promise<{ success: boolean; message: string; empresaId?: string; userId?: string; role?: UsuarioFirebase['rol'] }> {
  console.log('[AUTH_USER] Action started. Attempting to authenticate user for roles:', allowedRoles.join(', '));
  const validatedCredentials = LoginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    console.error('[AUTH_USER] Invalid credentials format:', validatedCredentials.error.flatten().fieldErrors);
    return { success: false, message: 'Datos de entrada inválidos.' };
  }

  const { email, password } = validatedCredentials.data;
  console.log(`[AUTH_USER] STEP 1: Validated credentials for email: ${email}`);

  try {
    console.time('[AUTH_USER] Firebase SignIn');
    console.log('[AUTH_USER] STEP 2: Attempting Firebase signInWithEmailAndPassword...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.timeEnd('[AUTH_USER] Firebase SignIn');
    console.log(`[AUTH_USER] STEP 3: Firebase Auth successful. User UID: ${firebaseUser.uid}`);

    console.time('[AUTH_USER] Firestore Get User Document');
    console.log(`[AUTH_USER] STEP 4: Attempting to get user document from Firestore: usuarios/${firebaseUser.uid}`);
    const userDocRef = doc(db, "usuarios", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    console.timeEnd('[AUTH_USER] Firestore Get User Document');

    if (userDocSnap.exists()) {
      console.log(`[AUTH_USER] STEP 5: User document found in Firestore. Data:`, userDocSnap.data());
      const userDataFromDb = userDocSnap.data();
      // Asegurarse de que los campos opcionales que son nullables lo sean
      const dataToParse = {
        id: userDocSnap.id,
        ...userDataFromDb,
        obrasAsignadas: userDataFromDb.obrasAsignadas || [],
        dniAnversoURL: userDataFromDb.dniAnversoURL === undefined ? null : userDataFromDb.dniAnversoURL,
        dniReversoURL: userDataFromDb.dniReversoURL === undefined ? null : userDataFromDb.dniReversoURL,
      };

      const userData = UsuarioFirebaseSchema.omit({password: true}).safeParse(dataToParse);
      
      if (!userData.success) {
        console.error('[AUTH_USER] STEP 5.1: Firestore user data validation error:', userData.error.flatten().fieldErrors);
        return { success: false, message: 'Error en los datos del usuario en base de datos. Contacte al administrador.' };
      }
      console.log('[AUTH_USER] STEP 5.2: Firestore user data parsed successfully.');
      
      const user = userData.data;

      if (!user.activo) {
        console.log('[AUTH_USER] STEP 6: User is inactive.');
        return { success: false, message: 'Esta cuenta de usuario está inactiva.' };
      }
      console.log('[AUTH_USER] STEP 6: User is active.');

      if (allowedRoles.includes(user.rol)) {
        console.log(`[AUTH_USER] STEP 7: User role '${user.rol}' is allowed. Login successful.`);
        return {
          success: true,
          message: 'Login exitoso.',
          empresaId: user.empresaId,
          userId: user.id,
          role: user.rol
        };
      } else {
        console.log(`[AUTH_USER] STEP 7: User role '${user.rol}' is NOT in allowed roles: ${allowedRoles.join(', ')}.`);
        return { success: false, message: 'Rol no autorizado para este tipo de acceso.' };
      }
    } else {
      console.log(`[AUTH_USER] STEP 5: User document NOT found in Firestore for UID: ${firebaseUser.uid}. This is an issue if user was seeded or should exist.`);
      return { success: false, message: 'No se encontraron datos adicionales del usuario en Firestore. El usuario de Auth existe, pero falta su registro en la base de datos de la aplicación.' };
    }
  } catch (error: any) {
    console.error("[AUTH_USER] Authentication process FAILED in catch block.");
    let message = 'Credenciales incorrectas o error de autenticación general.';
    console.error("[AUTH_USER] Error Name:", error.name);
    console.error("[AUTH_USER] Error Message:", error.message);
    if (error.code) {
      console.error("[AUTH_USER] Error Code (Firebase/etc.):", error.code);
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Email o contraseña incorrectos.';
          break;
        case 'auth/too-many-requests':
          message = 'Demasiados intentos fallidos de inicio de sesión. Por favor, inténtalo más tarde.';
          break;
        case 'auth/network-request-failed':
           message = 'Error de red al intentar iniciar sesión. Verifica tu conexión a internet.';
           break;
        default:
          message = `Error de autenticación: ${error.message || error.code}`;
      }
    } else if (error.message) {
      message = error.message;
    }
    
    console.error("[AUTH_USER] Final error message to client:", message);
    return { success: false, message };
  }
}


export async function getUsuariosByEmpresaId(empresaId: string): Promise<UsuarioFirebase[]> {
  try {
    const usuariosCollectionRef = collection(db, "usuarios");
    const q = query(usuariosCollectionRef, where("empresaId", "==", empresaId));
    const querySnapshot = await getDocs(q);
    
    const usuarios: UsuarioFirebase[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const dataToParse = {
        id: docSnap.id,
        ...data,
        // Ensure optional fields that are arrays are defaulted to empty arrays if not present
        obrasAsignadas: data.obrasAsignadas || [],
        // Ensure optional fields that are nullable are defaulted to null if undefined
        dniAnversoURL: data.dniAnversoURL === undefined ? null : data.dniAnversoURL,
        dniReversoURL: data.dniReversoURL === undefined ? null : data.dniReversoURL,
      };
      const parseResult = UsuarioFirebaseSchema.omit({password: true}).safeParse(dataToParse);
      if (parseResult.success) {
        usuarios.push(parseResult.data);
      } else {
        console.warn("Invalid user data in Firestore (getUsuariosByEmpresaId), skipping:", docSnap.id, parseResult.error.flatten().fieldErrors);
      }
    });
    return usuarios;
  } catch (error) {
    console.error("Error fetching usuarios by empresaId:", error);
    return [];
  }
}

export async function getUsuarioById(usuarioId: string): Promise<UsuarioFirebase | null> {
 try {
    const userDocRef = doc(db, "usuarios", usuarioId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      const dataToParse = {
        id: userDocSnap.id,
        ...data,
        obrasAsignadas: data.obrasAsignadas || [],
        dniAnversoURL: data.dniAnversoURL === undefined ? null : data.dniAnversoURL,
        dniReversoURL: data.dniReversoURL === undefined ? null : data.dniReversoURL,
      };
      const parseResult = UsuarioFirebaseSchema.omit({password: true}).safeParse(dataToParse);
       if (parseResult.success) {
        return parseResult.data;
      } else {
        console.warn("Invalid user data in Firestore for ID (getUsuarioById):", usuarioId, parseResult.error.flatten().fieldErrors);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching usuario by ID:", error);
    return null;
  }
}

const UpdateUsuarioSchemaFirebase = UsuarioFirebaseSchema.pick({
  nombre: true,
  email: true,
  dni: true,
  rol: true,
  activo: true,
  obrasAsignadas: true, 
  dniAnversoURL: true,
  dniReversoURL: true,
}).partial();


export async function updateUsuario(
    usuarioId: string, 
    empresaIdAuth: string, 
    data: Partial<Omit<UsuarioFirebase, 'id' | 'empresaId' | 'password'>>
): Promise<{ success: boolean; message: string; usuario?: UsuarioFirebase }> {
  let existingUserData: any = null; 
  try {
    const userDocRef = doc(db, "usuarios", usuarioId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Usuario no encontrado." };
    }
    existingUserData = userSnap.data(); 
    if (existingUserData.empresaId !== empresaIdAuth) {
       return { success: false, message: "No autorizado para modificar este usuario." };
    }

    const validationResult = UpdateUsuarioSchemaFirebase.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const errorMessages = Object.values(errors).flat().join(', ');
      return { success: false, message: `Error de validación: ${errorMessages}` };
    }
    
    const dataToUpdate: Record<string, any> = { ...validationResult.data, updatedAt: serverTimestamp()};

    // Explicitly handle nullable fields if they are passed as undefined, or ensure optional arrays are handled.
    if (data.hasOwnProperty('dniAnversoURL') && data.dniAnversoURL === undefined) dataToUpdate.dniAnversoURL = null;
    if (data.hasOwnProperty('dniReversoURL') && data.dniReversoURL === undefined) dataToUpdate.dniReversoURL = null;
    if (data.hasOwnProperty('obrasAsignadas') && data.obrasAsignadas === undefined) dataToUpdate.obrasAsignadas = [];


    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);

    await updateDoc(userDocRef, dataToUpdate);
    
    const updatedUserSnap = await getDoc(userDocRef);
    const updatedUserData = updatedUserSnap.data();
    if (!updatedUserData) {
      throw new Error("Failed to fetch user data after update.");
    }
    const dataToParseForReturn = {
      id: updatedUserSnap.id,
      ...updatedUserData,
      obrasAsignadas: updatedUserData.obrasAsignadas || [],
      dniAnversoURL: updatedUserData.dniAnversoURL === undefined ? null : updatedUserData.dniAnversoURL,
      dniReversoURL: updatedUserData.dniReversoURL === undefined ? null : updatedUserData.dniReversoURL,
    };
    const updatedUser = UsuarioFirebaseSchema.omit({password:true}).parse(dataToParseForReturn);

    revalidatePath('/(app)/usuarios');
    revalidatePath(`/(app)/usuarios/${usuarioId}/edit`);
  
    return { success: true, message: 'Usuario actualizado con éxito.', usuario: updatedUser };
  } catch (error: any) {
      console.error("Error updating usuario:", error);
      let message = 'Error al actualizar el usuario.';
      if (error.code === 'auth/email-already-in-use' && data.email && existingUserData && data.email !== existingUserData.email) {
          message = 'El nuevo email ya está en uso por otra cuenta.';
      }
      return { success: false, message };
  }
}

const RegisterTrabajadorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().min(1, "El DNI es requerido").regex(/^[0-9XYZxyz][0-9]{7}[A-HJ-NP-TV-Z]$/i, "Formato de DNI/NIE inválido"),
  dniAnversoURL: z.string().url("URL de foto de anverso de DNI inválida").optional().nullable(),
  dniReversoURL: z.string().url("URL de foto de reverso de DNI inválida").optional().nullable(),
});
type RegisterTrabajadorData = z.infer<typeof RegisterTrabajadorSchema>;

export async function registerTrabajador(
  empresaId: string, 
  data: RegisterTrabajadorData
): Promise<{ success: boolean; message: string; usuario?: UsuarioFirebase }> {
  
  const validationResult = RegisterTrabajadorSchema.safeParse(data);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    const errorMessages = Object.values(errors).flat().join(', ');
    return { success: false, message: `Error de validación: ${errorMessages}` };
  }

  try {
    const emailQuery = query(collection(db, "usuarios"), where("empresaId", "==", empresaId), where("email", "==", data.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return { success: false, message: 'Ya existe un trabajador con este email en tu empresa.' };
    }

    const dniQuery = query(collection(db, "usuarios"), where("empresaId", "==", empresaId), where("dni", "==", data.dni));
    const dniSnapshot = await getDocs(dniQuery);
    if (!dniSnapshot.empty) {
      return { success: false, message: 'Ya existe un trabajador con este DNI en tu empresa.' };
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.dni);
    const trabajadorUid = userCredential.user.uid;

    const rawUsuarioData = {
      id: trabajadorUid,
      empresaId: empresaId,
      nombre: data.nombre,
      email: data.email,
      dni: data.dni,
      rol: 'trabajador' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: data.dniAnversoURL || null,
      dniReversoURL: data.dniReversoURL || null,
    };

    const newUsuarioDataToStore = UsuarioFirebaseSchema.omit({ password: true }).parse(rawUsuarioData);
    
    await setDoc(doc(db, "usuarios", trabajadorUid), { 
        ...newUsuarioDataToStore, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
    });

    revalidatePath('/(app)/usuarios');
    revalidatePath('/(app)/company-profile');
  
    return { success: true, message: 'Trabajador registrado con éxito. Su contraseña inicial es su DNI.', usuario: newUsuarioDataToStore };
  } catch (error: any) {
    console.error("Error registering trabajador:", error);
    let message = 'Error al registrar el trabajador.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'El email proporcionado ya está en uso por otra cuenta en el sistema.';
    } else if (error.code === 'auth/weak-password') {
      message = 'La contraseña (DNI) es demasiado débil. Contacte a soporte.';
    }
    return { success: false, message };
  }
}

export async function deleteUsuario(usuarioId: string, empresaIdAuth: string): Promise<{ success: boolean; message: string }> {
  try {
    const userDocRef = doc(db, "usuarios", usuarioId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Usuario no encontrado." };
    }
    const userData = userSnap.data();
    if (userData.empresaId !== empresaIdAuth) {
      return { success: false, message: "No autorizado para eliminar este usuario." };
    }
    if (userData.rol === 'admin') {
        const adminQuery = query(collection(db, "usuarios"), where("empresaId", "==", empresaIdAuth), where("rol", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);
        if (adminSnapshot.size <= 1) {
            return { success: false, message: "No se puede eliminar el único administrador de la empresa." };
        }
    }
    
    const obrasComoJefeQuery = query(collection(db, "obras"), where("empresaId", "==", empresaIdAuth), where("jefeObraId", "==", usuarioId));
    const obrasComoJefeSnap = await getDocs(obrasComoJefeQuery);
    const batch = writeBatch(db);
    obrasComoJefeSnap.forEach(obraDoc => {
        batch.update(obraDoc.ref, { jefeObraId: null });
    });
    
    batch.delete(userDocRef);
    await batch.commit();

    revalidatePath('/(app)/usuarios');
    return { success: true, message: 'Usuario (solo registro en base de datos) eliminado con éxito y desasignado como jefe de obra donde aplique.' };

  } catch (error) {
    console.error("Error deleting usuario:", error);
    return { success: false, message: 'Error al eliminar el usuario.' };
  }
}

