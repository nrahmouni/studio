// src/lib/actions/seed.actions.ts
'use server';

import { db } from '@/lib/firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  arrayUnion,
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

// --- IDs de Demostración (puedes cambiarlos si quieres) ---
const DEMO_EMPRESA_ID = 'demo-empresa-obralink';
const DEMO_EMPRESA_CIF = 'A00000000DEMO';
const DEMO_ADMIN_ID = 'demo-admin-user-uid'; // Simula un UID de Firebase Auth
const DEMO_TRABAJADOR_ID = 'demo-trabajador-user-uid'; // Simula un UID
const DEMO_OBRA_ID = 'demo-obra-001';
const DEMO_PARTE_ID = 'demo-parte-001';
const DEMO_FICHAJE_ID_ENTRADA = 'demo-fichaje-entrada-001';
const DEMO_FICHAJE_ID_SALIDA = 'demo-fichaje-salida-001';
const DEMO_CONTROLDIA_ID = `${DEMO_OBRA_ID}-${new Date().toISOString().split('T')[0]}`;


export async function seedDemoData(): Promise<{ success: boolean; message: string; summary?: Record<string, string> }> {
  console.log('[SEED DATA] Iniciando proceso de seeding...');
  const summary: Record<string, string> = {};

  try {
    // 0. Verificar si la empresa demo ya existe para evitar duplicados
    const empresaCifQuery = query(collection(db, "empresas"), where("CIF", "==", DEMO_EMPRESA_CIF));
    const empresaCifSnapshot = await getDocs(empresaCifQuery);
    if (!empresaCifSnapshot.empty) {
      const existingEmpresaId = empresaCifSnapshot.docs[0].id;
      summary.empresa = `Empresa demo con CIF ${DEMO_EMPRESA_CIF} ya existe (ID: ${existingEmpresaId}). Saltando creación.`;
      console.log(summary.empresa);
      // Podrías optar por detener o continuar actualizando/verificando otros datos.
      // Por ahora, si la empresa existe, asumimos que el resto también y no hacemos nada más para este script simple.
      // return { success: true, message: "Los datos de demostración ya parecen existir.", summary };
    }

    const batch = writeBatch(db);

    // 1. Crear Empresa Demo
    const empresaDemoRef = doc(db, "empresas", DEMO_EMPRESA_ID);
    const empresaDemoData: Omit<Empresa, 'id'> = {
      nombre: 'Constructora DemoLink',
      CIF: DEMO_EMPRESA_CIF,
      emailContacto: 'contacto@demolink.com',
      telefono: '900123123',
      logoURL: `https://placehold.co/200x100.png`,
      dataAIHint: 'company logo',
    };
    // No necesitamos parsear con EmpresaSchema aquí si estamos seguros de la estructura,
    // pero para consistencia, es buena práctica. Omitimos 'id' ya que lo gestiona Firestore.
    const validatedEmpresaData = EmpresaSchema.omit({id: true}).parse(empresaDemoData);
    batch.set(empresaDemoRef, { ...validatedEmpresaData, id: DEMO_EMPRESA_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.empresa = `Empresa DemoLink creada (ID: ${DEMO_EMPRESA_ID}).`;
    console.log(summary.empresa);

    // 2. Crear Usuario Administrador Demo
    // IMPORTANTE: Esto crea el documento en Firestore, NO en Firebase Auth.
    // Deberás crear manualmente un usuario en Firebase Auth con este email y contraseña 'password'
    // o ajustar el script para llamar a `createUserWithEmailAndPassword`.
    const adminDemoRef = doc(db, "usuarios", DEMO_ADMIN_ID);
    const adminDemoData: Omit<UsuarioFirebase, 'id' | 'password'> = {
      empresaId: DEMO_EMPRESA_ID,
      nombre: 'Admin Demo',
      email: 'admin@demolink.com',
      dni: '00000000A',
      rol: 'admin',
      activo: true,
      obrasAsignadas: [],
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    const validatedAdminData = UsuarioFirebaseSchema.omit({id: true, password: true}).parse(adminDemoData);
    batch.set(adminDemoRef, { ...validatedAdminData, id: DEMO_ADMIN_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.admin = `Usuario Admin Demo creado (ID: ${DEMO_ADMIN_ID}). Email: admin@demolink.com, Pass (simulada): password`;
    console.log(summary.admin);

    // 3. Crear Usuario Trabajador Demo
    const trabajadorDemoRef = doc(db, "usuarios", DEMO_TRABAJADOR_ID);
    const trabajadorDemoData: Omit<UsuarioFirebase, 'id' | 'password'> = {
      empresaId: DEMO_EMPRESA_ID,
      nombre: 'Trabajador Demo Uno',
      email: 'trabajador1@demolink.com',
      dni: '11111111T',
      rol: 'trabajador',
      activo: true,
      obrasAsignadas: [DEMO_OBRA_ID], // Pre-asignar a la obra demo
      dniAnversoURL: null,
      dniReversoURL: null,
    };
    const validatedTrabajadorData = UsuarioFirebaseSchema.omit({id: true, password: true}).parse(trabajadorDemoData);
    batch.set(trabajadorDemoRef, { ...validatedTrabajadorData, id: DEMO_TRABAJADOR_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.trabajador = `Usuario Trabajador Demo creado (ID: ${DEMO_TRABAJADOR_ID}). Email: trabajador1@demolink.com, Pass (simulada): 11111111T`;
    console.log(summary.trabajador);

    // 4. Crear Obra Demo
    const obraDemoRef = doc(db, "obras", DEMO_OBRA_ID);
    const obraDemoData: Omit<Obra, 'id'> = {
      empresaId: DEMO_EMPRESA_ID,
      nombre: 'Proyecto Alfa Demo',
      direccion: 'Calle Falsa 123, Ciudad Demo',
      fechaInicio: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() - 30))), // Hace 30 días
      fechaFin: Timestamp.fromDate(new Date(new Date().setDate(new Date().getDate() + 60))), // En 60 días
      clienteNombre: 'Cliente Estrella S.L.',
      jefeObraId: DEMO_ADMIN_ID, // Admin es jefe de obra para este demo
      descripcion: 'Obra de demostración para probar funcionalidades de ObraLink.',
      costosPorCategoria: [
        CostoCategoriaSchema.parse({ id: 'cost-cat-1', categoria: 'Materiales Iniciales', costo: 15000, notas: 'Compra cemento y ladrillos' }),
        CostoCategoriaSchema.parse({ id: 'cost-cat-2', categoria: 'Mano de Obra Prevista', costo: 25000, notas: 'Estimación equipo base' }),
      ],
      dataAIHint: 'construction site crane',
    };
    const validatedObraData = ObraSchema.omit({id: true}).parse(obraDemoData);
    batch.set(obraDemoRef, { ...validatedObraData, id: DEMO_OBRA_ID, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    summary.obra = `Obra Demo creada (ID: ${DEMO_OBRA_ID}).`;
    console.log(summary.obra);

    // 5. Crear Parte de Trabajo Demo
    const parteDemoRef = doc(db, "partes", DEMO_PARTE_ID);
    const parteDemoData: Omit<Parte, 'id' | 'timestamp'> = {
      usuarioId: DEMO_TRABAJADOR_ID,
      obraId: DEMO_OBRA_ID,
      fecha: Timestamp.fromDate(new Date()), // Hoy
      tareasRealizadas: 'Se comenzó con la preparación del terreno y replanteo. Instalación de vallas perimetrales.',
      horasTrabajadas: 8,
      incidencias: 'Pequeño retraso por lluvia matutina.',
      tareasSeleccionadas: ['Replanteo', 'Excavación Pequeña', 'Seguridad'],
      fotosURLs: [`https://placehold.co/600x400.png`, `https://placehold.co/601x401.png`],
      firmaURL: `https://placehold.co/300x150.png`, // Placeholder para URL de firma
      validado: false,
      validadoPor: null,
      dataAIHint: 'construction safety fence',
    };
    const validatedParteData = ParteSchema.omit({id: true, timestamp: true}).parse(parteDemoData);
    batch.set(parteDemoRef, { ...validatedParteData, id: DEMO_PARTE_ID, timestamp: serverTimestamp() });
    summary.parte = `Parte Demo creado (ID: ${DEMO_PARTE_ID}).`;
    console.log(summary.parte);
    
    // 6. Crear Fichajes Demo para el trabajador
    const fichajeEntradaRef = doc(db, "fichajes", DEMO_FICHAJE_ID_ENTRADA);
    const fichajeEntradaData: Omit<Fichaje, 'id'> = {
        usuarioId: DEMO_TRABAJADOR_ID,
        obraId: DEMO_OBRA_ID,
        tipo: 'entrada',
        timestamp: Timestamp.fromDate(new Date(new Date().setHours(8,0,0,0))), // Hoy a las 8 AM
        validado: false,
        validadoPor: null,
    };
    batch.set(fichajeEntradaRef, {...FichajeSchema.omit({id:true}).parse(fichajeEntradaData), id: DEMO_FICHAJE_ID_ENTRADA });
    
    const fichajeSalidaRef = doc(db, "fichajes", DEMO_FICHAJE_ID_SALIDA);
    const fichajeSalidaData: Omit<Fichaje, 'id'> = {
        usuarioId: DEMO_TRABAJADOR_ID,
        obraId: DEMO_OBRA_ID,
        tipo: 'salida',
        timestamp: Timestamp.fromDate(new Date(new Date().setHours(17,0,0,0))), // Hoy a las 5 PM
        validado: false,
        validadoPor: null,
    };
    batch.set(fichajeSalidaRef, {...FichajeSchema.omit({id:true}).parse(fichajeSalidaData), id: DEMO_FICHAJE_ID_SALIDA });
    summary.fichajes = `Fichajes demo de entrada y salida creados para Trabajador Demo Uno.`;
    console.log(summary.fichajes);

    // 7. Crear Control Diario Demo
    const controlDiarioRef = doc(db, "controlDiario", DEMO_CONTROLDIA_ID);
    const controlDiarioData: Omit<ControlDiarioObra, 'id'> = {
        obraId: DEMO_OBRA_ID,
        fecha: Timestamp.fromDate(new Date()), // Hoy
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
        lastModified: Timestamp.fromDate(new Date()), // Será serverTimestamp
    };
    const validatedControlDiarioData = ControlDiarioObraSchema.omit({id: true, lastModified: true}).parse(controlDiarioData);
    batch.set(controlDiarioRef, { ...validatedControlDiarioData, id: DEMO_CONTROLDIA_ID, lastModified: serverTimestamp()});
    summary.controlDiario = `Entrada de Control Diario Demo creada (ID: ${DEMO_CONTROLDIA_ID}).`;
    console.log(summary.controlDiario);


    // Commitear todas las operaciones en un batch
    await batch.commit();
    console.log('[SEED DATA] Batch commit exitoso.');

    revalidatePath('/(app)', 'layout'); // Revalidar todas las rutas bajo (app)

    return { success: true, message: 'Datos de demostración creados con éxito en Firestore.', summary };

  } catch (error: any) {
    console.error('[SEED DATA] Error al crear datos de demostración:', error);
    summary.error = error.message;
    return { success: false, message: `Error al crear datos de demostración: ${error.message}`, summary };
  }
}
