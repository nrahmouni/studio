
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


export const CostoCategoriaSchema = z.object({
  id: z.string(), // For UI key management and easier updates
  categoria: z.string().min(1, "La categoría es requerida"),
  costo: z.number().min(0, "El costo no puede ser negativo"),
  notas: z.string().optional(),
});
export type CostoCategoria = z.infer<typeof CostoCategoriaSchema>;

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
  costosPorCategoria: z.array(CostoCategoriaSchema).optional(),
  dataAIHint: z.string().optional(),
});
export type Obra = z.infer<typeof ObraSchema>;


export const UsuarioFirebaseSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().min(1, "El DNI es requerido").regex(/^[0-9XYZxyz][0-9]{7}[A-HJ-NP-TV-Z]$/i, "Formato de DNI/NIE inválido (e.g., 12345678A o X1234567B)"),
  password: z.string().min(1, "Contraseña requerida para simulación"),
  rol: z.enum(["admin", "trabajador", "jefeObra"]),
  activo: z.boolean().default(true),
  obrasAsignadas: z.array(z.string()).optional(),
  empresaId: z.string(),
  dniAnversoURL: z.string().url("URL de foto de anverso de DNI inválida").optional().nullable(),
  dniReversoURL: z.string().url("URL de foto de reverso de DNI inválida").optional().nullable(),
});
export type UsuarioFirebase = z.infer<typeof UsuarioFirebaseSchema>;


export const ParteSchema = z.object({
  id: z.string(),
  usuarioId: z.string().min(1, "El ID de usuario es requerido"),
  obraId: z.string().min(1, "El ID de obra es requerido"),
  fecha: z.date({ required_error: "La fecha es requerida."}),
  tareasRealizadas: z.string().min(1, "Las tareas realizadas son requeridas"),
  horasTrabajadas: z.number().positive("Las horas deben ser positivas y mayores que cero.").optional().nullable(),
  tareasSeleccionadas: z.array(z.string()).optional(),
  fotosURLs: z.array(z.string().url()).optional(),
  firmaURL: z.string().url("URL de firma inválida").optional().nullable(),
  incidencias: z.string().optional(),
  validado: z.boolean().default(false),
  validadoPor: z.string().optional(),
  timestamp: z.date(),
  dataAIHint: z.string().optional(),
});
export type Parte = z.infer<typeof ParteSchema>;

export const FichajeSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  obraId: z.string(),
  tipo: z.enum(["entrada", "salida", "inicioDescanso", "finDescanso"]),
  timestamp: z.date(),
  validado: z.boolean().default(false).optional(),
  validadoPor: z.string().optional().nullable(),
});
export type Fichaje = z.infer<typeof FichajeSchema>;
export type FichajeTipo = z.infer<typeof FichajeSchema.shape.tipo>;

