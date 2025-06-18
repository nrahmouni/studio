
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
  obrasAsignadas: true, 
  dniAnversoURL: true,
  dniReversoURL: true,
}).partial();


export async function updateUsuario(
    usuarioId: string, 
    empresaIdAuth: string, 
    data: Partial<Omit<UsuarioFirebase, 'id' | 'empresaId' | 'password'>>
): Promise<{ success: boolean; message: string; usuario?: UsuarioFirebase }> {
  let existingUserData: any = null; // Define to access in catch block
  try {
    const userDocRef = doc(db, "usuarios", usuarioId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, message: "Usuario no encontrado." };
    }
    existingUserData = userSnap.data(); // Assign here
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

    // Construct the full user object that matches UsuarioFirebaseSchema
    const rawUsuarioData = {
      id: trabajadorUid,
      empresaId: empresaId,
      nombre: data.nombre,
      email: data.email,
      dni: data.dni,
      password: data.dni, // Password is not stored, but schema expects it for initial creation if needed
      rol: 'trabajador' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: data.dniAnversoURL || null,
      dniReversoURL: data.dniReversoURL || null,
      // Firebase timestamps will be added by Firestore
    };

    // Validate the full object against the base schema before saving
    // Omit password for storage, it's already handled by Firebase Auth
    const newUsuarioDataToStore = UsuarioFirebaseSchema.omit({ password: true }).parse(rawUsuarioData);
    
    await setDoc(doc(db, "usuarios", trabajadorUid), { 
        ...newUsuarioDataToStore, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
    });

    revalidatePath('/(app)/usuarios');
    revalidatePath('/(app)/company-profile');
  
    // Return the validated data (without password)
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
    
    // TODO: Consider deleting parts, fichajes etc. associated with this user or reassigning.
    // For now, just unassigning as jefeObra and deleting user document.

    batch.delete(userDocRef);
    await batch.commit();

    // Firebase Auth user is NOT deleted here. This needs Admin SDK or client-side re-auth.
    // Consider deactivating the Auth user instead if full deletion via Admin SDK is not feasible.

    revalidatePath('/(app)/usuarios');
    return { success: true, message: 'Usuario (solo registro en base de datos) eliminado con éxito y desasignado como jefe de obra donde aplique.' };

  } catch (error) {
    console.error("Error deleting usuario:", error);
    return { success: false, message: 'Error al eliminar el usuario.' };
  }
}
