
// src/lib/actions/controlDiario.actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  ControlDiarioObraSchema,
  type ControlDiarioObra,
  type ControlDiarioRegistroTrabajador,
  type ControlDiarioObraFormData // Import the specific form data type
} from '@/lib/types';
import { mockControlDiarioData } from '@/lib/mockData/controlDiario';
import { mockUsuarios } from '@/lib/mockData/usuarios';
import { mockObras } from '@/lib/mockData/obras';

let CcontrolDiario: ControlDiarioObra[] = [...mockControlDiarioData];

export async function getControlDiario(
  obraId: string,
  fecha: Date,
  jefeObraId: string,
  empresaId: string
): Promise<ControlDiarioObra | null> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

  const fechaString = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
  const existingRecord = CcontrolDiario.find(
    (cd) => cd.obraId === obraId && cd.fecha.toISOString().split('T')[0] === fechaString
  );

  if (existingRecord) {
    // Ensure all assigned workers are present in the record, add if missing
    const obra = mockObras.find(o => o.id === obraId && o.empresaId === empresaId);
    if (!obra) return existingRecord; // Or handle error

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
        // Ensure nombreTrabajador is up-to-date
        const registro = existingRecord.registrosTrabajadores.find(rt => rt.usuarioId === workerId);
        if (registro && !registro.nombreTrabajador) {
            const worker = mockUsuarios.find(u => u.id === workerId);
            registro.nombreTrabajador = worker?.nombre || 'Desconocido';
        }
      }
    });
     // Sort by worker name for consistent display
    existingRecord.registrosTrabajadores.sort((a, b) => (a.nombreTrabajador || '').localeCompare(b.nombreTrabajador || ''));
    return existingRecord;
  }

  // If no record exists, create a new "shell" record
  const obra = mockObras.find(o => o.id === obraId && o.empresaId === empresaId);
  if (!obra) {
    console.error(`Obra con ID ${obraId} no encontrada para la empresa ${empresaId}.`);
    return null; // Obra no encontrada o no pertenece a la empresa
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
    id: `${obraId}-${fechaString}`, // Construct ID
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
  data: ControlDiarioObraFormData, // Changed: Expects the form data type directly
  currentJefeObraId: string
): Promise<{ success: boolean; message: string; controlDiario?: ControlDiarioObra }> {

  // data.fecha is already a Date object from ControlDiarioObraFormData
  // Add jefeObraId before validation
  const dataToValidate = {
    ...data, // data is ControlDiarioObraFormData (fecha: Date, no jefeObraId)
    jefeObraId: currentJefeObraId, // jefeObraId is added here
  };

  // This schema will validate the object that now includes jefeObraId and expects fecha as Date
  const InternalValidationSchema = ControlDiarioObraSchema.omit({
    id: true, // id will be constructed later
    lastModified: true, // will be set on save
  });

  const validationResult = InternalValidationSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    console.error("Validation error saving control diario:", validationResult.error.flatten().fieldErrors);
    return { success: false, message: `Error de validación: ${JSON.stringify(validationResult.error.flatten().fieldErrors)}` };
  }

  const validatedData = validationResult.data; // This now has jefeObraId and fecha as Date
  const recordId = `${validatedData.obraId}-${validatedData.fecha.toISOString().split('T')[0]}`;

  const recordToSave: ControlDiarioObra = {
    ...validatedData, // validatedData now correctly typed and includes all necessary fields
    id: recordId,
    lastModified: new Date(),
  };

  const recordIndex = CcontrolDiario.findIndex((cd) => cd.id === recordId);

  if (recordIndex > -1) {
    CcontrolDiario[recordIndex] = recordToSave;
  } else {
    CcontrolDiario.push(recordToSave);
  }

  revalidatePath('/(app)/control-diario');
  // Potentially revalidate other paths if this data impacts them.

  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  console.log("Control diario guardado:", recordToSave);
  return { success: true, message: 'Control diario guardado con éxito.', controlDiario: recordToSave };
}
