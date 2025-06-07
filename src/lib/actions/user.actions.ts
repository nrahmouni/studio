'use server';
import { z } from 'zod';
import { UsuarioFirebaseSchema, type UsuarioFirebase } from '@/lib/types';
import { mockUsuarios } from '@/lib/mockData/usuarios';

let CUsuarios: UsuarioFirebase[] = [...mockUsuarios];

// Esquema para la autenticación
const LoginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Contraseña requerida.'),
});

export async function authenticateEmpresa(credentials: z.infer<typeof LoginSchema>): Promise<{ success: boolean; message: string; empresaId?: string }> {
  const validatedCredentials = LoginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    return { success: false, message: 'Datos de entrada inválidos.' };
  }

  const { email, password } = validatedCredentials.data;

  // Simulación de búsqueda de empresa/admin
  const adminUser = CUsuarios.find(
    user => user.email === email && user.password === password && (user.rol === 'admin' || user.rol === 'jefeObra')
  );

  if (adminUser) {
    // En una app real, aquí se generaría un token de sesión, etc.
    return { success: true, message: 'Login de empresa exitoso.', empresaId: adminUser.empresaId };
  } else {
    return { success: false, message: 'Credenciales de empresa incorrectas.' };
  }
}

export async function authenticateTrabajador(credentials: z.infer<typeof LoginSchema>): Promise<{ success: boolean; message: string; usuarioId?: string; empresaId?: string }> {
  const validatedCredentials = LoginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    return { success: false, message: 'Datos de entrada inválidos.' };
  }

  const { email, password } = validatedCredentials.data;

  // Simulación de búsqueda de trabajador
  const workerUser = CUsuarios.find(
    user => user.email === email && user.password === password && user.rol === 'trabajador'
  );

  if (workerUser) {
    // En una app real, aquí se generaría un token de sesión, etc.
    return { success: true, message: 'Login de trabajador exitoso.', usuarioId: workerUser.id, empresaId: workerUser.empresaId };
  } else {
    return { success: false, message: 'Credenciales de trabajador incorrectas.' };
  }
}

export async function getUsuariosByEmpresaId(empresaId: string): Promise<UsuarioFirebase[]> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  return CUsuarios.filter(user => user.empresaId === empresaId);
}

export async function getUsuarioById(usuarioId: string): Promise<UsuarioFirebase | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  const user = CUsuarios.find(user => user.id === usuarioId);
  return user || null;
}

// Potentially add create, update, delete functions for users if needed later
// For now, focusing on authentication and retrieval for the login simulation.
