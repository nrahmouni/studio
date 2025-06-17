
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
  const validatedCredentials = LoginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    return { success: false, message: 'Datos de entrada inválidos.' };
  }

  const { email, password } = validatedCredentials.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userDocRef = doc(db, "usuarios", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = UsuarioFirebaseSchema.omit({password: true}).safeParse({id: userDocSnap.id, ...userDocSnap.data()});
      if (!userData.success) {
        console.error("Firestore user data validation error:", userData.error);
        return { success: false, message: 'Error en los datos del usuario en base de datos.' };
      }
      
      const user = userData.data;

      if (!user.activo) {
        return { success: false, message: 'Esta cuenta de usuario está inactiva.' };
      }

      if (allowedRoles.includes(user.rol)) {
        return { 
          success: true, 
          message: 'Login exitoso.', 
          empresaId: user.empresaId, 
          userId: user.id, 
          role: user.rol 
        };
      } else {
        return { success: false, message: 'Rol no autorizado para este tipo de acceso.' };
      }
    } else {
      return { success: false, message: 'No se encontraron datos adicionales del usuario.' };
    }
  } catch (error: any) {
    console.error("Authentication error:", error);
    let message = 'Credenciales incorrectas o error de autenticación.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = 'Email o contraseña incorrectos.';
    }
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
      const parseResult = UsuarioFirebaseSchema.omit({password: true}).safeParse({ id: docSnap.id, ...docSnap.data()});
      if (parseResult.success) {
        usuarios.push(parseResult.data);
      } else {
        console.warn("Invalid user data in Firestore, skipping:", docSnap.id, parseResult.error);
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
      const parseResult = UsuarioFirebaseSchema.omit({password: true}).safeParse({ id: userDocSnap.id, ...userDocSnap.data()});
       if (parseResult.success) {
        return parseResult.data;
      } else {
        console.warn("Invalid user data in Firestore for ID:", usuarioId, parseResult.error);
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
  obrasAsignadas: true, // Keep this, will be handled by Obra update
  dniAnversoURL: true,
  dniReversoURL: true,
}).partial();


export async function updateUsuario(
    usuarioId: string, 
    empresaIdAuth: string, // Used to verify updater's company matches user's company
    data: Partial<Omit<UsuarioFirebase, 'id' | 'empresaId' | 'password'>>
): Promise<{ success: boolean; message: string; usuario?: UsuarioFirebase }> {
  try {
    const userDocRef = doc(db, "usuarios", usuarioId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Usuario no encontrado." };
    }
    const existingUserData = userSnap.data();
    if (existingUserData.empresaId !== empresaIdAuth) {
       return { success: false, message: "No autorizado para modificar este usuario." };
    }

    const validationResult = UpdateUsuarioSchemaFirebase.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const errorMessages = Object.values(errors).flat().join(', ');
      return { success: false, message: `Error de validación: ${errorMessages}` };
    }
    
    const dataToUpdate = { ...validationResult.data, updatedAt: serverTimestamp()};
    // Remove undefined fields
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);


    await updateDoc(userDocRef, dataToUpdate);
    
    const updatedUserSnap = await getDoc(userDocRef);
    const updatedUser = UsuarioFirebaseSchema.omit({password:true}).parse({id: updatedUserSnap.id, ...updatedUserSnap.data()});

    revalidatePath('/(app)/usuarios');
    revalidatePath(`/(app)/usuarios/${usuarioId}/edit`);
  
    return { success: true, message: 'Usuario actualizado con éxito.', usuario: updatedUser };
  } catch (error: any) {
      console.error("Error updating usuario:", error);
      let message = 'Error al actualizar el usuario.';
      if (error.code === 'auth/email-already-in-use' && data.email !== existingUserData?.email) {
          message = 'El nuevo email ya está en uso por otra cuenta.';
          // Note: Firebase Auth email update needs separate handling if email is changed here.
          // This simplified version only updates Firestore. For real email change, update Firebase Auth email too.
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
    // Check if email or DNI already exists for this company in Firestore
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
    
    // Create Firebase Auth user for the trabajador
    // IMPORTANT: For production, consider sending a verification email or a temporary password mechanism.
    // Using DNI as password is for simplicity here.
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.dni);
    const trabajadorUid = userCredential.user.uid;

    const newUsuarioData: UsuarioFirebase = {
      id: trabajadorUid,
      empresaId: empresaId,
      nombre: data.nombre,
      email: data.email,
      dni: data.dni,
      password: '', // Not stored in Firestore
      rol: 'trabajador',
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: data.dniAnversoURL || null,
      dniReversoURL: data.dniReversoURL || null,
    };

    await setDoc(doc(db, "usuarios", trabajadorUid), { ...newUsuarioData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

    revalidatePath('/(app)/usuarios');
    revalidatePath('/(app)/company-profile');
  
    return { success: true, message: 'Trabajador registrado con éxito. Su contraseña inicial es su DNI.', usuario: newUsuarioData };
  } catch (error: any) {
    console.error("Error registering trabajador:", error);
    let message = 'Error al registrar el trabajador.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'El email proporcionado ya está en uso por otra cuenta en el sistema.';
    } else if (error.code === 'auth/weak-password') {
      // This might occur if DNI is too short/simple, though unlikely with typical DNI formats.
      message = 'La contraseña (DNI) es demasiado débil. Contacte a soporte.';
    }
    return { success: false, message };
  }
}


// Function to delete a user from Firebase Auth and Firestore
// This is a sensitive operation and should be restricted (e.g., only admins can delete users of their company)
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
        // Prevent deletion of the last admin or handle company deletion logic separately
        const adminQuery = query(collection(db, "usuarios"), where("empresaId", "==", empresaIdAuth), where("rol", "==", "admin"));
        const adminSnapshot = await getDocs(adminQuery);
        if (adminSnapshot.size <= 1) {
            return { success: false, message: "No se puede eliminar el único administrador de la empresa." };
        }
    }

    // It's generally not recommended to directly delete Firebase Auth users from server-side actions
    // without proper admin SDK setup due to security.
    // For now, we will only delete the Firestore record. Auth user deletion would need Firebase Admin SDK.
    // Or, the client could call a Firebase function to handle Auth user deletion.
    // For this context, we'll just mark as inactive if preferred or just delete Firestore record.
    // Let's proceed with Firestore deletion.

    // Before deleting user, consider impact on related data (obras assigned, partes, etc.)
    // For instance, unassign from obras or mark partes as from "deleted user"
    // This example only deletes the user document.
    
    // Example: Unassign user from obras they are Jefe de Obra for
    const obrasComoJefeQuery = query(collection(db, "obras"), where("empresaId", "==", empresaIdAuth), where("jefeObraId", "==", usuarioId));
    const obrasComoJefeSnap = await getDocs(obrasComoJefeQuery);
    const batch = writeBatch(db);
    obrasComoJefeSnap.forEach(obraDoc => {
        batch.update(obraDoc.ref, { jefeObraId: null });
    });
    await batch.commit();


    await deleteDoc(userDocRef);
    // Note: Firebase Auth user is NOT deleted here. This requires Admin SDK or client-side re-authentication and deletion.
    // This could lead to an orphaned Auth account.
    // A better approach for "deletion" in many systems is to mark the user as inactive.
    // await updateDoc(userDocRef, { activo: false, email: `deleted_${Date.now()}_${userData.email}` });


    revalidatePath('/(app)/usuarios');
    return { success: true, message: 'Usuario eliminado (solo registro en base de datos) con éxito.' };

  } catch (error) {
    console.error("Error deleting usuario:", error);
    return { success: false, message: 'Error al eliminar el usuario.' };
  }
}
