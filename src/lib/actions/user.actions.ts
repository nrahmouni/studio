
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

export async function authenticateEmpresa(credentials: z.infer<typeof LoginSchema>): Promise<{ success: boolean; message: string; empresaId?: string; userId?: string; role?: UsuarioFirebase['rol'] }> {
  const validatedCredentials = LoginSchema.safeParse(credentials);
  if (!validatedCredentials.success) {
    return { success: false, message: 'Datos de entrada inválidos.' };
  }

  const { email, password } = validatedCredentials.data;

  // Simulación de búsqueda de empresa/admin/jefeObra
  const user = CUsuarios.find(
    u => u.email === email && u.password === password && (u.rol === 'admin' || u.rol === 'jefeObra')
  );

  if (user) {
    return { success: true, message: 'Login de empresa exitoso.', empresaId: user.empresaId, userId: user.id, role: user.rol };
  } else {
    return { success: false, message: 'Credenciales de empresa incorrectas o rol no autorizado para este acceso.' };
  }
}

export async function authenticateTrabajador(credentials: z.infer<typeof LoginSchema>): Promise<{ success: boolean; message: string; usuarioId?: string; empresaId?: string, role?: UsuarioFirebase['rol'] }> {
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
    return { success: true, message: 'Login de trabajador exitoso.', usuarioId: workerUser.id, empresaId: workerUser.empresaId, role: workerUser.rol };
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

const UpdateUsuarioSchema = UsuarioFirebaseSchema.partial().omit({ id: true, empresaId: true, password: true });

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

  // Check if email or DNI already exists for this company
  const existingUser = CUsuarios.find(u => u.empresaId === empresaId && (u.email === data.email || u.dni === data.dni));
  if (existingUser) {
    const field = existingUser.email === data.email ? 'email' : 'DNI';
    return { success: false, message: `Ya existe un trabajador con este ${field} en tu empresa.` };
  }

  const newUsuario: UsuarioFirebase = {
    ...validationResult.data,
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    empresaId: empresaId,
    rol: 'trabajador',
    activo: true,
    password: data.dni, // Using DNI as default password for simplicity in mock
    obrasAsignadas: [],
    // dniAnversoURL and dniReversoURL are already in validationResult.data
  };

  CUsuarios.push(newUsuario);
  revalidatePath('/(app)/usuarios');
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, message: 'Trabajador registrado con éxito.', usuario: newUsuario };
}
