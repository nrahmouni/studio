
import { z } from 'zod';

export const ConstructoraSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
});
export type Constructora = z.infer<typeof ConstructoraSchema>;

// Subcontracted company (like Caram)
export const SubcontrataSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  clientesConstructoraIds: z.array(z.string()).optional(), // IDs of Constructoras they work for
});
export type Subcontrata = z.infer<typeof SubcontrataSchema>;

// A project, now linked to a Constructora (client) and a Subcontrata
export const ProyectoSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  constructoraId: z.string(),
  subcontrataId: z.string(),
  direccion: z.string().min(1, "La dirección es requerida"),
  clienteNombre: z.string().min(1, "El nombre del cliente es requerido").optional(),
  fechaInicio: z.date().optional().nullable(),
  fechaFin: z.date().optional().nullable(),
});
export type Proyecto = z.infer<typeof ProyectoSchema>;

// Worker model, separate from password-based users
export const TrabajadorSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  subcontrataId: z.string(),
  codigoAcceso: z.string().min(1, "El código es requerido"),
  proyectosAsignados: z.array(z.string()).optional(),
  categoriaProfesional: z.enum(["oficial", "peon", "maquinista", "encofrador"]).optional(),
});
export type Trabajador = z.infer<typeof TrabajadorSchema>;

// Maquinaria model
export const MaquinariaSchema = z.object({
    id: z.string(),
    subcontrataId: z.string(),
    nombre: z.string().min(1, "El nombre es requerido"),
    matriculaORef: z.string().min(1, "La matrícula o referencia es requerida"),
    proyectosAsignados: z.array(z.string()).optional(),
    dataAIHint: z.string().optional(),
});
export type Maquinaria = z.infer<typeof MaquinariaSchema>;


// User model for roles that log in with email/password
export const UsuarioSchema = z.object({
  id: z.string(), // Could be Firebase Auth UID in a real scenario
  email: z.string().email(),
  nombre: z.string().optional(),
  rol: z.enum(["encargado", "subcontrata_admin", "constructora_admin"]),
  // Link to the company they belong to
  subcontrataId: z.string().optional().nullable(),
  constructoraId: z.string().optional().nullable(),
  activo: z.boolean().default(true),
});
export type Usuario = z.infer<typeof UsuarioSchema>;

export const ReporteTrabajadorSchema = z.object({
    trabajadorId: z.string(),
    nombre: z.string(),
    asistencia: z.boolean(),
    horas: z.number().min(0),
});
export type ReporteTrabajador = z.infer<typeof ReporteTrabajadorSchema>;

// Report for a specific day on a project
export const ReporteDiarioSchema = z.object({
  id: z.string(), // e.g., {proyectoId}-{YYYY-MM-DD}
  proyectoId: z.string(),
  fecha: z.date(),
  trabajadores: z.array(ReporteTrabajadorSchema),
  encargadoId: z.string(), // User ID of the Encargado who submitted
  timestamp: z.date(),
  comentarios: z.string().optional().nullable(),
  fotosURLs: z.array(z.string().url()).optional(),
  // Validation stages
  validacion: z.object({
    encargado: z.object({ validado: z.boolean(), timestamp: z.date().nullable() }),
    subcontrata: z.object({ validado: z.boolean(), timestamp: z.date().nullable() }),
    constructora: z.object({ validado: z.boolean(), timestamp: z.date().nullable() }),
  }),
  // For modifications by Jefe de Obra
  modificacionJefeObra: z.object({
    modificado: z.boolean(),
    jefeObraId: z.string().nullable(),
    timestamp: z.date().nullable(),
    reporteOriginal: z.string().nullable(), // JSON string of the original 'trabajadores' array
  }).optional(),
});
export type ReporteDiario = z.infer<typeof ReporteDiarioSchema>;


// Simplified time tracking for workers
export const FichajeTrabajadorSchema = z.object({
  id: z.string(),
  trabajadorId: z.string(),
  tipo: z.enum(["inicio", "fin"]),
  timestamp: z.string(),
  ubicacion: z.string().optional(), // e.g., "lat,long"
});
export type FichajeTrabajador = z.infer<typeof FichajeTrabajadorSchema>;
