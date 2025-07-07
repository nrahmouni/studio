// src/lib/actions/auth.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, auth } from '@/lib/firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { ConstructoraSchema, SubcontrataSchema, UsuarioSchema, TrabajadorSchema, type Usuario } from '../types';

// --- REGISTRATION ---

const RegisterFormSchema = z.object({
  companyName: z.string().min(2),
  companyType: z.enum(['constructora', 'subcontrata']),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

export async function registerNewCompany(data: z.infer<typeof RegisterFormSchema>) {
  const validation = RegisterFormSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Datos de registro inválidos.' };
  }
  const { companyName, companyType, adminEmail, adminPassword } = validation.data;

  try {
    // Check if user email already exists in our system
    const userQuery = query(collection(db, 'usuarios'), where('email', '==', adminEmail));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      return { success: false, message: 'El email del administrador ya está en uso.' };
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = userCredential.user.uid;

    const companyCollection = companyType === 'constructora' ? 'constructoras' : 'subcontratas';
    const companyRef = doc(collection(db, companyCollection));
    
    // Create company document
    const companyData = { nombre: companyName, id: companyRef.id };
    await setDoc(companyRef, companyData);

    // Create user document
    const userRef = doc(db, 'usuarios', adminUid);
    const userData: Omit<Usuario, 'id'> = {
      email: adminEmail,
      nombre: adminEmail.split('@')[0],
      rol: companyType === 'constructora' ? 'constructora_admin' : 'subcontrata_admin',
      activo: true,
      constructoraId: companyType === 'constructora' ? companyRef.id : null,
      subcontrataId: companyType === 'subcontrata' ? companyRef.id : null,
    };
    await setDoc(userRef, userData);

    return { success: true, message: 'Empresa registrada con éxito.' };

  } catch (error: any) {
    let message = 'Error desconocido durante el registro.';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Este email ya está registrado en el sistema de autenticación.';
    }
    console.error("Registration error:", error);
    return { success: false, message };
  }
}

// --- AUTHENTICATION ---

const PasswordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authenticateUserByPassword(credentials: z.infer<typeof PasswordLoginSchema>) {
  const validation = PasswordLoginSchema.safeParse(credentials);
  if (!validation.success) {
    return { success: false, message: 'Datos de inicio de sesión inválidos.' };
  }
  const { email, password } = validation.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (!userDoc.exists()) {
      return { success: false, message: 'Usuario autenticado pero no encontrado en la base de datos de la aplicación.' };
    }
    const userData = userDoc.data() as Usuario;
    if (!userData.activo) {
      return { success: false, message: 'Este usuario está inactivo.' };
    }

    return {
      success: true,
      message: 'Login exitoso',
      userId: user.uid,
      role: userData.rol,
      constructoraId: userData.constructoraId,
      subcontrataId: userData.subcontrataId,
    };

  } catch (error: any) {
    console.error("Password login error:", error);
    return { success: false, message: 'Email o contraseña incorrectos.' };
  }
}

export async function authenticateTrabajadorByCode(accessCode: string) {
  if (!accessCode || accessCode.length < 6) {
    return { success: false, message: 'El código de acceso es inválido.' };
  }

  try {
    const q = query(collection(db, 'trabajadores'), where('codigoAcceso', '==', accessCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: 'Código de acceso no encontrado.' };
    }

    const trabajadorDoc = snapshot.docs[0];
    const trabajadorData = trabajadorDoc.data() as Omit<Trabajador, 'id'>;

    return {
      success: true,
      message: 'Acceso concedido.',
      trabajadorId: trabajadorDoc.id,
      nombre: trabajadorData.nombre,
      subcontrataId: trabajadorData.subcontrataId,
    };
  } catch (error: any) {
    console.error("Worker code login error:", error);
    return { success: false, message: 'Ocurrió un error al verificar el código.' };
  }
}
