import { z } from 'zod';

export const EmpresaSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  CIF: z.string().min(1, "El CIF es requerido"),
  emailContacto: z.string().email("Email de contacto inválido"),
  telefono: z.string().min(1, "El teléfono es requerido"),
  logoURL: z.string().url("URL de logo inválida").optional().nullable(),
  dataAIHint: z.string().optional(), // For placeholder images
});
export type Empresa = z.infer<typeof EmpresaSchema>;


export const ObraSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  nombre: z.string().min(1, "El nombre de la obra es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  fechaInicio: z.date({ required_error: "La fecha de inicio es requerida."}),
  fechaFin: z.date().optional().nullable(),
  clienteNombre: z.string().min(1, "El nombre del cliente es requerido"),
  jefeObraId: z.string().optional(), // Referencia a UsuarioFirebase.id
  descripcion: z.string().optional(),
  dataAIHint: z.string().optional(), 
});
export type Obra = z.infer<typeof ObraSchema>;


export const UsuarioFirebaseSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida para simulación"), // Added for mock auth
  rol: z.enum(["admin", "trabajador", "jefeObra"]),
  activo: z.boolean().default(true),
  obrasAsignadas: z.array(z.string()).optional(), // Array de obraId
  empresaId: z.string(),
});
export type UsuarioFirebase = z.infer<typeof UsuarioFirebaseSchema>;


export const ParteSchema = z.object({
  id: z.string(),
  usuarioId: z.string().min(1, "El ID de usuario es requerido"), // Referencia a UsuarioFirebase.id
  obraId: z.string().min(1, "El ID de obra es requerido"), // Referencia a Obra.id
  fecha: z.date({ required_error: "La fecha es requerida."}),
  tareasRealizadas: z.string().min(1, "Las tareas realizadas son requeridas"),
  tareasSeleccionadas: z.array(z.string()).optional(),
  fotosURLs: z.array(z.string().url()).optional(),
  firmaURL: z.string().url("URL de firma inválida").optional().nullable(),
  incidencias: z.string().optional(),
  validado: z.boolean().default(false),
  validadoPor: z.string().optional(), // Referencia a UsuarioFirebase.id (admin/jefeObra)
  timestamp: z.date().default(() => new Date()),
  dataAIHint: z.string().optional(),
});
export type Parte = z.infer<typeof ParteSchema>;

export const FichajeSchema = z.object({
  id: z.string(),
  usuarioId: z.string(), // Referencia a UsuarioFirebase.id
  obraId: z.string(), // Referencia a Obra.id
  tipo: z.enum(["entrada", "salida"]),
  ubicacion: z.object({
    lat: z.number(),
    lon: z.number(),
  }).optional(),
  timestamp: z.date().default(() => new Date()),
});
export type Fichaje = z.infer<typeof FichajeSchema>;
