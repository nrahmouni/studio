
import type { ControlDiarioObra } from '@/lib/types';

const today = new Date();
const yesterday = new Date(new Date().setDate(today.getDate() - 1));
const twoDaysAgo = new Date(new Date().setDate(today.getDate() - 2));
const threeDaysAgo = new Date(new Date().setDate(today.getDate() - 3));

export const mockControlDiarioData: ControlDiarioObra[] = [
  // Controles diarios existentes
  {
    id: `obra-1-1-${yesterday.toISOString().split('T')[0]}`,
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    fecha: yesterday,
    jefeObraId: 'user-1-jefeobra-1', // Carlos López
    registrosTrabajadores: [
      {
        usuarioId: 'user-1-trabajador-1', // Lucía Fernández
        nombreTrabajador: 'Lucía Fernández (Trabajadora Demo)',
        asistencia: true,
        horaInicio: '08:00',
        horaFin: '17:00',
        horasReportadas: 8,
        validadoPorJefeObra: true,
      },
      {
        usuarioId: 'user-1-trabajador-3', // Javier Soler
        nombreTrabajador: 'Javier Soler (Trabajador CM)',
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
        nombreTrabajador: 'Marcos García (Trabajador CM)',
        asistencia: true,
        horaInicio: '09:00',
        horaFin: '18:00',
        horasReportadas: 8, 
        validadoPorJefeObra: false,
      },
      {
        usuarioId: 'user-1-trabajador-3', // Javier Soler
        nombreTrabajador: 'Javier Soler (Trabajador CM)',
        asistencia: false, 
        horaInicio: null,
        horaFin: null,
        horasReportadas: 0,
        validadoPorJefeObra: true, 
      },
    ],
    firmaJefeObraURL: null,
    lastModified: today,
  },
  // --- Nuevos Controles Diarios ---
  {
    id: `obra-1-5-${twoDaysAgo.toISOString().split('T')[0]}`, // Nueva obra, Jefe existente
    obraId: 'obra-1-5', // Vivienda Unifamiliar "El Mirador"
    fecha: twoDaysAgo,
    jefeObraId: 'user-1-jefeobra-1', // Carlos López
    registrosTrabajadores: [
      {
        usuarioId: 'user-1-trabajador-1', // Lucía Fernández
        nombreTrabajador: 'Lucía Fernández (Trabajadora Demo)',
        asistencia: true,
        horaInicio: '08:30',
        horaFin: '17:30',
        horasReportadas: 8,
        validadoPorJefeObra: true,
      },
      {
        usuarioId: 'user-1-trabajador-6', // Andrea Gil (Nueva)
        nombreTrabajador: 'Andrea Gil (Trabajadora CM)',
        asistencia: true,
        horaInicio: '08:30',
        horaFin: '17:00',
        horasReportadas: 7.5,
        validadoPorJefeObra: false,
      },
      {
        usuarioId: 'user-1-trabajador-5', // David Reyes (Inactivo, pero podría haber trabajado ese día)
        nombreTrabajador: 'David Reyes (Trabajador CM)',
        asistencia: false,
        horaInicio: null,
        horaFin: null,
        horasReportadas: 0,
        validadoPorJefeObra: true,
      }
    ],
    firmaJefeObraURL: 'https://placehold.co/200x100.png?text=Firma+Carlos+Hace+2+Dias',
    lastModified: twoDaysAgo,
  },
  {
    id: `obra-1-6-${yesterday.toISOString().split('T')[0]}`, // Nueva obra, Nuevo Jefe
    obraId: 'obra-1-6', // Parking Subterráneo
    fecha: yesterday,
    jefeObraId: 'user-1-jefeobra-3', // Roberto Sanz
    registrosTrabajadores: [
      {
        usuarioId: 'user-1-trabajador-2', // Marcos García
        nombreTrabajador: 'Marcos García (Trabajador CM)',
        asistencia: true,
        horaInicio: '07:45',
        horaFin: '16:15',
        horasReportadas: 8,
        validadoPorJefeObra: true,
      },
      {
        usuarioId: 'user-1-trabajador-7', // Sergio Peña (Nuevo)
        nombreTrabajador: 'Sergio Peña (Trabajador CM)',
        asistencia: true,
        horaInicio: '08:00',
        horaFin: '16:00',
        horasReportadas: 7,
        validadoPorJefeObra: false,
      },
      {
        usuarioId: 'user-1-trabajador-4', // Sofía Navarro
        nombreTrabajador: 'Sofía Navarro (Trabajadora CM)',
        asistencia: true,
        horaInicio: '08:00',
        horaFin: '12:00', // Media jornada
        horasReportadas: 4,
        validadoPorJefeObra: true,
      }
    ],
    firmaJefeObraURL: null,
    lastModified: yesterday,
  },
  {
    id: `obra-2-3-${threeDaysAgo.toISOString().split('T')[0]}`, // Nueva obra Empresa 2, Nueva Jefa
    obraId: 'obra-2-3', // Impermeabilización Cubierta
    fecha: threeDaysAgo,
    jefeObraId: 'user-2-jefeobra-2', // Mónica Vidal
    registrosTrabajadores: [
      {
        usuarioId: 'user-2-trabajador-1', // David Sanz
        nombreTrabajador: 'David Sanz (Trabajador Alfa)',
        asistencia: true,
        horaInicio: '09:00',
        horaFin: '17:30',
        horasReportadas: 7.5,
        validadoPorJefeObra: true,
      },
      {
        usuarioId: 'user-2-trabajador-3', // Carlos Ruiz (Nuevo)
        nombreTrabajador: 'Carlos Ruiz (Trabajador Alfa)',
        asistencia: true,
        horaInicio: '09:15',
        horaFin: '17:15',
        horasReportadas: 7,
        validadoPorJefeObra: false,
      },
    ],
    firmaJefeObraURL: 'https://placehold.co/200x100.png?text=Firma+Monica',
    lastModified: threeDaysAgo,
  },
  {
    id: `obra-3-4-${today.toISOString().split('T')[0]}`, // Nueva obra Empresa 3, Nuevo Jefe
    obraId: 'obra-3-4', // Centro Deportivo Municipal
    fecha: today,
    jefeObraId: 'user-3-jefeobra-3', // Javier Martín
    registrosTrabajadores: [
      {
        usuarioId: 'user-3-trabajador-1', // Laura Jimenez
        nombreTrabajador: 'Laura Jimenez (Trabajadora Edifica)',
        asistencia: true,
        horaInicio: '08:00',
        horaFin: '16:00',
        horasReportadas: 7,
        validadoPorJefeObra: false,
      },
      {
        usuarioId: 'user-3-trabajador-3', // Isabel Roca (Nueva)
        nombreTrabajador: 'Isabel Roca (Trabajadora Edifica)',
        asistencia: true,
        horaInicio: '08:00',
        horaFin: '13:00',
        horasReportadas: 5,
        validadoPorJefeObra: false,
      },
      {
        usuarioId: 'user-3-trabajador-4', // Mario Luna (Nuevo)
        nombreTrabajador: 'Mario Luna (Trabajador Edifica)',
        asistencia: false,
        horaInicio: null,
        horaFin: null,
        horasReportadas: 0,
        validadoPorJefeObra: true,
      }
    ],
    firmaJefeObraURL: null,
    lastModified: today,
  }
];
