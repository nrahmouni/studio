// src/lib/actions/user.actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
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

const UpdateUsuarioSchema = UsuarioFirebaseSchema.partial().omit({ id: true, empresaId: true, password: true }); // Password usually handled separately

export async function updateUsuario(usuarioId: string, empresaIdAuth: string, data: Partial<Omit<UsuarioFirebase, 'id' | 'empresaId' | 'password'>>): Promise<{ success: boolean; message: string; usuario?: UsuarioFirebase }> {
  const userIndex = CUsuarios.findIndex(u => u.id === usuarioId);
  if (userIndex === -1) {
    return { success: false, message: "Usuario no encontrado." };
  }

  if (CUsuarios[userIndex].empresaId !== empresaIdAuth) {
    return { success: false, message: "No autorizado para modificar este usuario." };
  }

  const validationResult = UpdateUsuarioSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  CUsuarios[userIndex] = { ...CUsuarios[userIndex], ...validationResult.data };
  
  revalidatePath('/(app)/usuarios');
  revalidatePath(`/(app)/usuarios/${usuarioId}/edit`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Usuario actualizado con éxito.', usuario: CUsuarios[userIndex] };
}
