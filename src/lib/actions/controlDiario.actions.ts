
// src/lib/actions/controlDiario.actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  ControlDiarioObraSchema,
  type ControlDiarioObra,
  type ControlDiarioRegistroTrabajador,
  type ControlDiarioObraFormData,
  type Parte, // Import Parte type
} from '@/lib/types';
import { mockControlDiarioData } from '@/lib/mockData/controlDiario';
import { mockUsuarios } from '@/lib/mockData/usuarios';
import { mockObras } from '@/lib/mockData/obras';
import { createParte, updateParte, getParteByWorkerObraDate } from './parte.actions'; // Import parte actions

let CcontrolDiario: ControlDiarioObra[] = [...mockControlDiarioData];

export async function getControlDiario(
  obraId: string,
  fecha: Date,
  jefeObraId: string,
  empresaId: string
): Promise<ControlDiarioObra | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); 

  const fechaString = fecha.toISOString().split('T')[0]; 
  const existingRecord = CcontrolDiario.find(
    (cd) => cd.obraId === obraId && cd.fecha.toISOString().split('T')[0] === fechaString
  );

  if (existingRecord) {
    const obra = mockObras.find(o => o.id === obraId && o.empresaId === empresaId);
    if (!obra) return existingRecord; 

    const assignedWorkerIds = mockUsuarios
      .filter(u => u.empresaId === empresaId && u.rol === 'trabajador' && u.obrasAsignadas?.includes(obraId))
      .map(u => u.id);

    const recordWorkerIds = new Set(existingRecord.registrosTrabajadores.map(rt => rt.usuarioId));

    assignedWorkerIds.forEach(workerId => {
      if (!recordWorkerIds.has(workerId)) {
        const worker = mockUsuarios.find(u => u.id === workerId);
        existingRecord.registrosTrabajadores.push({
          usuarioId: workerId,
          nombreTrabajador: worker?.nombre || 'Desconocido',
          asistencia: false,
          horaInicio: null,
          horaFin: null,
          horasReportadas: null,
          validadoPorJefeObra: false,
        });
      } else {
        const registro = existingRecord.registrosTrabajadores.find(rt => rt.usuarioId === workerId);
        if (registro && !registro.nombreTrabajador) {
            const worker = mockUsuarios.find(u => u.id === workerId);
            if(worker) registro.nombreTrabajador = worker.nombre;
        }
      }
    });
    existingRecord.registrosTrabajadores.sort((a, b) => (a.nombreTrabajador || '').localeCompare(b.nombreTrabajador || ''));
    return existingRecord;
  }

  const obra = mockObras.find(o => o.id === obraId && o.empresaId === empresaId);
  if (!obra) {
    console.error(`Obra con ID ${obraId} no encontrada para la empresa ${empresaId}.`);
    return null; 
  }

  const assignedWorkers = mockUsuarios.filter(
    (user) => user.empresaId === empresaId && user.rol === 'trabajador' && user.obrasAsignadas?.includes(obraId)
  );

  const newShellRegistros: ControlDiarioRegistroTrabajador[] = assignedWorkers.map((worker) => ({
    usuarioId: worker.id,
    nombreTrabajador: worker.nombre,
    asistencia: false,
    horaInicio: null,
    horaFin: null,
    horasReportadas: null,
    validadoPorJefeObra: false,
  })).sort((a, b) => (a.nombreTrabajador || '').localeCompare(b.nombreTrabajador || ''));


  const newShellRecord: ControlDiarioObra = {
    id: `${obraId}-${fechaString}`, 
    obraId,
    fecha,
    jefeObraId,
    registrosTrabajadores: newShellRegistros,
    firmaJefeObraURL: null,
    lastModified: new Date(),
  };
  return newShellRecord;
}

export async function saveControlDiario(
  data: ControlDiarioObraFormData, 
  currentJefeObraId: string
): Promise<{ success: boolean; message: string; controlDiario?: ControlDiarioObra }> {

  const dataToValidate = {
    ...data, 
    jefeObraId: currentJefeObraId, 
  };

  const InternalValidationSchema = ControlDiarioObraSchema.omit({
    id: true, 
    lastModified: true, 
  });

  const validationResult = InternalValidationSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    console.error("Validation error saving control diario:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const validatedData = validationResult.data; 
  const recordId = `${validatedData.obraId}-${validatedData.fecha.toISOString().split('T')[0]}`;
  
  const obraDelControl = mockObras.find(o => o.id === validatedData.obraId);
  if (!obraDelControl) {
    return { success: false, message: 'Obra no encontrada para este control diario.' };
  }
  const empresaId = obraDelControl.empresaId;

  const recordToSave: ControlDiarioObra = {
    ...validatedData, 
    id: recordId,
    lastModified: new Date(),
  };

  const recordIndex = CcontrolDiario.findIndex((cd) => cd.id === recordId);

  if (recordIndex > -1) {
    CcontrolDiario[recordIndex] = recordToSave;
  } else {
    CcontrolDiario.push(recordToSave);
  }

  // --- Inicio de la lógica para crear/actualizar Partes ---
  const jefeObraActual = mockUsuarios.find(u => u.id === recordToSave.jefeObraId);
  const nombreJefeObra = jefeObraActual?.nombre || 'Jefe de Obra';

  for (const registro of recordToSave.registrosTrabajadores) {
    if (registro.asistencia && registro.horasReportadas != null && registro.horasReportadas > 0) {
      
      const existingParte = await getParteByWorkerObraDate(
        registro.usuarioId,
        recordToSave.obraId,
        recordToSave.fecha,
        empresaId 
      );

      if (existingParte) {
        if (!existingParte.validado) { 
          const parteUpdateData: Partial<Omit<Parte, 'id' | 'usuarioId' | 'timestamp'>> = {
            horasTrabajadas: registro.horasReportadas,
            validado: true,
            validadoPor: recordToSave.jefeObraId,
            tareasRealizadas: existingParte.tareasRealizadas.includes("Control Diario") 
              ? existingParte.tareasRealizadas 
              : `${existingParte.tareasRealizadas}\n(Horas y asistencia actualizadas y validadas vía Control Diario por ${nombreJefeObra} el ${new Date().toLocaleDateString()}).`.trim(),
          };
          await updateParte(existingParte.id, parteUpdateData as UpdateParteData); // Cast to UpdateParteData
        }
      } else {
        const parteCreateData = { 
          usuarioId: registro.usuarioId,
          obraId: recordToSave.obraId,
          fecha: recordToSave.fecha,
          tareasRealizadas: `Trabajo registrado y validado mediante Control Diario por ${nombreJefeObra}.`,
          horasTrabajadas: registro.horasReportadas,
          incidencias: '', 
          tareasSeleccionadas: [],
          fotosURLs: [],
          firmaURL: null,
          validado: true, 
          validadoPor: recordToSave.jefeObraId,
        };
        await createParte(parteCreateData);
      }
    }
  }
  // --- Fin de la lógica para crear/actualizar Partes ---

  revalidatePath('/(app)/control-diario');
  revalidatePath('/(app)/partes'); 

  await new Promise(resolve => setTimeout(resolve, 500)); 
  return { success: true, message: 'Control diario guardado y partes de trabajo actualizados/creados.', controlDiario: recordToSave };
}

// Definición local del tipo UpdateParteData ya que no se puede importar directamente desde parte.actions.ts
// debido a las reglas de 'use server'. Esta definición debe coincidir con la de parte.actions.ts
type UpdateParteData = Partial<Omit<Parte, 'id' | 'usuarioId' | 'timestamp'>>;
