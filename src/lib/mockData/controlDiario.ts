
// src/lib/mockData/controlDiario.ts
import type { ControlDiarioObra } from '@/lib/types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

export const mockControlDiarioData: ControlDiarioObra[] = [
  {
    id: `obra-1-1-${yesterday.toISOString().split('T')[0]}`,
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    fecha: yesterday,
    jefeObraId: 'user-1-jefeobra-1', // Carlos López
    registrosTrabajadores: [
      {
        usuarioId: 'user-1-trabajador-1', // Lucía Fernández
        asistencia: true,
        horaInicio: '08:00',
        horaFin: '17:00',
        horasReportadas: 8,
        validadoPorJefeObra: true,
      },
      {
        usuarioId: 'user-1-trabajador-3', // Javier Soler
        asistencia: true,
        horaInicio: '08:15',
        horaFin: '16:45',
        horasReportadas: 7.5,
        validadoPorJefeObra: false,
      },
    ],
    firmaJefeObraURL: 'https://placehold.co/200x100.png?text=Firma+Carlos+Ayer',
    lastModified: yesterday,
  },
  {
    id: `obra-1-2-${today.toISOString().split('T')[0]}`,
    obraId: 'obra-1-2', // Construcción Nave Industrial Logística
    fecha: today,
    jefeObraId: 'user-1-jefeobra-2', // Elena García
    registrosTrabajadores: [
      {
        usuarioId: 'user-1-trabajador-2', // Marcos García
        asistencia: true,
        horaInicio: '09:00',
        horaFin: '18:00',
        horasReportadas: 8, // Example: 1 hour break not deducted yet by Jefe
        validadoPorJefeObra: false,
      },
      {
        usuarioId: 'user-1-trabajador-3', // Javier Soler
        asistencia: false, // No asistió
        horaInicio: null,
        horaFin: null,
        horasReportadas: 0,
        validadoPorJefeObra: true, // Jefe valida la no asistencia
      },
    ],
    firmaJefeObraURL: null,
    lastModified: today,
  },
];
