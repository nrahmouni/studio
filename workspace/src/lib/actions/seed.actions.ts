
// src/lib/actions/seed.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import {
  collection,
  doc,
  setDoc,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  EmpresaSchema,
  UsuarioFirebaseSchema,
  ObraSchema,
  ParteSchema,
  FichajeSchema,
  ControlDiarioObraSchema,
  CostoCategoriaSchema,
  type Empresa,
  type UsuarioFirebase,
  type Obra,
  type Parte,
  type Fichaje,
  type ControlDiarioObra,
} from '@/lib/types';
import { revalidatePath } from 'next/cache';

// --- IDs de Demostración ---
const DEMO_EMPRESA_ID = 'demo-empresa-obralink';
const DEMO_ADMIN_ID = 'demo-admin-user-uid'; // Simula un UID de Firebase Auth
const DEMO_TRABAJADOR_ID = 'demo-trabajador-user-uid'; // Simula un UID
const DEMO_OBRA_ID = 'demo-obra-001';
const DEMO_PARTE_ID = 'demo-parte-001';
const DEMO_FICHAJE_ID_ENTRADA = 'demo-fichaje-entrada-001';
const DEMO_FICHAJE_ID_SALIDA = 'demo-fichaje-salida-001';
const DEMO_CONTROLDIA_ID_BASE = `${DEMO_OBRA_ID}`; // Date part will be added

export async function seedDemoData(): Promise<{ success: boolean; message: string; summary?: Record<string, string> }> {
  console.log('[SEED DATA] Iniciando proceso de seeding...');
  const summary: Record<string, string> = {};
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const DEMO_CONTROLDIA_ID = `${DEMO_CONTROLDIA_ID_BASE}-${todayString}`;

  try {
    const batch = writeBatch(db);

    // 1. Crear Empresa Demo
    const empresaDemoRef = doc(db, "empresas", DEMO_EMPRESA_ID);
    const empresaDemoDataRaw: Omit<Empresa, 'id' | 'dataAIHint'> & { dataAIHint?: string } = {
      nombre: 'Constructora DemoLink',
      CIF: 'A00000000DEMO', 
      emailContacto: 'contacto@demolink.com',
      telefono: '900123123',
      logoURL: `https://placehold.co/200x100.png`,
      dataAIHint: 'company logo',
    };
    const validatedEmpresaData = EmpresaSchema.omit({id: true}).parse(empresaDemoDataRaw);
    batch.set(empresaDemoRef, { ...validatedEmpresaData, id: DEMO_EMPRESA_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.empresa = `Empresa DemoLink (ID: ${DEMO_EMPRESA_ID}) preparada.`;
    console.log(summary.empresa);

    // 2. Crear Usuario Administrador Demo (Firestore Document)
    const adminDemoRef = doc(db, "usuarios", DEMO_ADMIN_ID);
    const adminDemoDataRaw: Omit<UsuarioFirebase, 'id' | 'password'> = {
      empresaId: DEMO_EMPRESA_ID,
      nombre: 'Admin Demo',
      email: 'admin@demolink.com',
      dni: '00000000A',        
      rol: 'admin' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    const validatedAdminData = UsuarioFirebaseSchema.omit({id: true, password: true}).parse(adminDemoDataRaw);
    batch.set(adminDemoRef, { ...validatedAdminData, id: DEMO_ADMIN_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.admin = `Usuario Admin Demo (ID: ${DEMO_ADMIN_ID}) preparado. Email: admin@demolink.com, Pass (para Auth): admin1234`;
    console.log(summary.admin);

    // 3. Crear Usuario Trabajador Demo (Firestore Document)
    const trabajadorDemoRef = doc(db, "usuarios", DEMO_TRABAJADOR_ID);
    const trabajadorDemoDataRaw: Omit<UsuarioFirebase, 'id' | 'password'> = {
      empresaId: DEMO_EMPRESA_ID,
      nombre: 'Trabajador Demo Uno',
      email: 'trabajador1@demolink.com', 
      dni: '11111111T',                 
      rol: 'trabajador' as UsuarioFirebase['rol'],
      activo: true,
      obrasAsignadas: [DEMO_OBRA_ID],
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    const validatedTrabajadorData = UsuarioFirebaseSchema.omit({id: true, password: true}).parse(trabajadorDemoDataRaw);
    batch.set(trabajadorDemoRef, { ...validatedTrabajadorData, id: DEMO_TRABAJADOR_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.trabajador = `Usuario Trabajador Demo (ID: ${DEMO_TRABAJADOR_ID}) preparado. Email: trabajador1@demolink.com, Pass (para Auth): 11111111T`;
    console.log(summary.trabajador);

    // 4. Crear Obra Demo
    const obraDemoRef = doc(db, "obras", DEMO_OBRA_ID);
    const obraDemoDataRaw: Omit<Obra, 'id' | 'dataAIHint'> & { dataAIHint?: string } = {
      empresaId: DEMO_EMPRESA_ID,
      nombre: 'Proyecto Alfa Demo',
      direccion: 'Calle Falsa 123, Ciudad Demo',
      fechaInicio: new Date(new Date().setDate(today.getDate() - 30)),
      fechaFin: new Date(new Date().setDate(today.getDate() + 60)),
      clienteNombre: 'Cliente Estrella S.L.',
      jefeObraId: DEMO_ADMIN_ID,
      descripcion: 'Obra de demostración para probar funcionalidades de ObraLink.',
      costosPorCategoria: [
        CostoCategoriaSchema.parse({ id: 'cost-cat-1', categoria: 'Materiales Iniciales', costo: 15000, notas: 'Compra cemento y ladrillos' }),
        CostoCategoriaSchema.parse({ id: 'cost-cat-2', categoria: 'Mano de Obra Prevista', costo: 25000, notas: 'Estimación equipo base' }),
      ],
      dataAIHint: 'construction site crane',
    };
    const validatedObraData = ObraSchema.omit({id: true}).parse({
      ...obraDemoDataRaw,
      fechaInicio: Timestamp.fromDate(obraDemoDataRaw.fechaInicio as Date),
      fechaFin: obraDemoDataRaw.fechaFin ? Timestamp.fromDate(obraDemoDataRaw.fechaFin as Date) : null,
    });
    batch.set(obraDemoRef, { ...validatedObraData, id: DEMO_OBRA_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.obra = `Obra Demo (ID: ${DEMO_OBRA_ID}) preparada.`;
    console.log(summary.obra);

    // 5. Crear Parte de Trabajo Demo
    const parteDemoRef = doc(db, "partes", DEMO_PARTE_ID);
    const parteDemoDataRaw: Omit<Parte, 'id' | 'timestamp' | 'dataAIHint'> & {dataAIHint?: string} = {
      usuarioId: DEMO_TRABAJADOR_ID,
      obraId: DEMO_OBRA_ID,
      fecha: today,
      tareasRealizadas: 'Se comenzó con la preparación del terreno y replanteo. Instalación de vallas perimetrales.',
      horasTrabajadas: 8,
      incidencias: 'Pequeño retraso por lluvia matutina.',
      tareasSeleccionadas: ['Replanteo', 'Excavación Pequeña', 'Seguridad'],
      fotosURLs: [`https://placehold.co/600x400.png`, `https://placehold.co/601x401.png`],
      firmaURL: `https://placehold.co/300x150.png`,
      validado: false,
      validadoPor: null,
      dataAIHint: 'construction safety fence',
    };
    const validatedParteData = ParteSchema.omit({id: true, timestamp: true}).parse({
        ...parteDemoDataRaw,
        fecha: Timestamp.fromDate(parteDemoDataRaw.fecha as Date),
    });
    batch.set(parteDemoRef, { ...validatedParteData, id: DEMO_PARTE_ID, timestamp: serverTimestamp() });
    summary.parte = `Parte Demo (ID: ${DEMO_PARTE_ID}) preparado.`;
    console.log(summary.parte);
    
    // 6. Crear Fichajes Demo
    const fichajeEntradaRef = doc(db, "fichajes", DEMO_FICHAJE_ID_ENTRADA);
    const fichajeEntradaDataRaw: Omit<Fichaje, 'id'> = {
        usuarioId: DEMO_TRABAJADOR_ID,
        obraId: DEMO_OBRA_ID,
        tipo: 'entrada' as Fichaje['tipo'],
        timestamp: new Date(new Date(today).setHours(8,0,0,0)),
        validado: false,
        validadoPor: null,
    };
    const validatedFichajeEntrada = FichajeSchema.omit({id:true}).parse({
        ...fichajeEntradaDataRaw,
        timestamp: Timestamp.fromDate(fichajeEntradaDataRaw.timestamp as Date),
    });
    batch.set(fichajeEntradaRef, { ...validatedFichajeEntrada, id: DEMO_FICHAJE_ID_ENTRADA });
    
    const fichajeSalidaRef = doc(db, "fichajes", DEMO_FICHAJE_ID_SALIDA);
    const fichajeSalidaDataRaw: Omit<Fichaje, 'id'> = {
        usuarioId: DEMO_TRABAJADOR_ID,
        obraId: DEMO_OBRA_ID,
        tipo: 'salida' as Fichaje['tipo'],
        timestamp: new Date(new Date(today).setHours(17,0,0,0)),
        validado: false,
        validadoPor: null,
    };
    const validatedFichajeSalida = FichajeSchema.omit({id:true}).parse({
        ...fichajeSalidaDataRaw,
        timestamp: Timestamp.fromDate(fichajeSalidaDataRaw.timestamp as Date),
    });
    batch.set(fichajeSalidaRef, { ...validatedFichajeSalida, id: DEMO_FICHAJE_ID_SALIDA });
    summary.fichajes = `Fichajes demo preparados.`;
    console.log(summary.fichajes);

    // 7. Crear Control Diario Demo
    const controlDiarioRef = doc(db, "controlDiario", DEMO_CONTROLDIA_ID);
    const controlDiarioDataRaw: Omit<ControlDiarioObra, 'id' | 'lastModified'> = {
        obraId: DEMO_OBRA_ID,
        fecha: today,
        jefeObraId: DEMO_ADMIN_ID,
        registrosTrabajadores: [
            {
                usuarioId: DEMO_TRABAJADOR_ID,
                nombreTrabajador: 'Trabajador Demo Uno',
                asistencia: true,
                horaInicio: '08:00',
                horaFin: '17:00',
                horasReportadas: 8,
                validadoPorJefeObra: false,
            }
        ],
        firmaJefeObraURL: null,
    };
    const validatedControlDiarioData = ControlDiarioObraSchema.omit({id: true, lastModified: true}).parse({
        ...controlDiarioDataRaw,
        fecha: Timestamp.fromDate(controlDiarioDataRaw.fecha as Date),
    });
    batch.set(controlDiarioRef, { ...validatedControlDiarioData, id: DEMO_CONTROLDIA_ID, lastModified: serverTimestamp()});
    summary.controlDiario = `Control Diario Demo (ID: ${DEMO_CONTROLDIA_ID}) preparado.`;
    console.log(summary.controlDiario);

    await batch.commit();
    console.log('[SEED DATA] Batch commit exitoso.');

    revalidatePath('/(app)', 'layout'); 

    return { success: true, message: 'Datos de demostración creados/actualizados con éxito en Firestore.', summary };

  } catch (error: any) {
    console.error('[SEED DATA] Error al crear datos de demostración:', error);
    summary.error_message = error.message;
    if (error.stack) summary.error_stack = error.stack;
    if (error instanceof z.ZodError) {
      summary.zod_error = JSON.stringify(error.flatten().fieldErrors);
      console.error('[SEED DATA] Zod Errors:', error.flatten().fieldErrors);
    }
    return { success: false, message: `Error al crear datos de demostración: ${error.message}`, summary };
  }
}
