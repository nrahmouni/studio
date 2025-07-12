// src/lib/mockData.ts
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria } from '@/lib/types';
import { sub, add, parseISO } from 'date-fns';

// --- MOCK IDs ---
export const MOCK_CONSTRUCTORA_ID = 'const-sorigui-mock';
export const MOCK_SUBCONTRATA_ID = 'sub-caram-mock';
export const MOCK_ENCARGADO_ID = 'user-encargado-mock';
export const MOCK_TRABAJADOR_ID_1 = 'trab-01-mock';
export const MOCK_TRABAJADOR_ID_2 = 'trab-02-mock';
export const MOCK_TRABAJADOR_ID_3 = 'trab-03-mock';
export const MOCK_PROYECTO_ID_1 = 'proy-meridiana';
export const MOCK_PROYECTO_ID_2 = 'proy-granvia';

// --- MOCK DATA COLLECTIONS ---

export let mockConstructoras: Constructora[] = [
    { id: MOCK_CONSTRUCTORA_ID, nombre: 'Constructora Sorigui' },
    { id: 'const-ferrovial-mock', nombre: 'Ferrovial' },
];

export let mockSubcontratas: Subcontrata[] = [
  { id: MOCK_SUBCONTRATA_ID, nombre: 'Excavaciones Caram', clientesConstructoraIds: [MOCK_CONSTRUCTORA_ID] },
  { id: 'sub-estructuras-sl', nombre: 'Estructuras Poveda S.L.', clientesConstructoraIds: [MOCK_CONSTRUCTORA_ID, 'const-ferrovial-mock'] },
];

export let mockProyectos: Proyecto[] = [
  { id: MOCK_PROYECTO_ID_1, nombre: 'Reforma Av. Meridiana', constructoraId: MOCK_CONSTRUCTORA_ID, subcontrataId: MOCK_SUBCONTRATA_ID, direccion: 'Avinguda Meridiana, 350, Barcelona', clienteNombre: 'Ayuntamiento de Barcelona', fechaInicio: sub(new Date(), {days: 10}), fechaFin: add(new Date(), {days: 60}) },
  { id: MOCK_PROYECTO_ID_2, nombre: 'Oficinas Gran Vía', constructoraId: 'const-ferrovial-mock', subcontrataId: MOCK_SUBCONTRATA_ID, direccion: 'Calle Gran Vía, 28, Madrid', clienteNombre: 'Banco Innovador', fechaInicio: sub(new Date(), {days: 45}), fechaFin: add(new Date(), {days: 120}) },
  { id: 'proy-finalizado', nombre: 'Centro Cívico Raval', constructoraId: MOCK_CONSTRUCTORA_ID, subcontrataId: 'sub-estructuras-sl', direccion: 'Carrer de la Cera, 1, Barcelona', clienteNombre: 'Distrito Ciutat Vella', fechaInicio: sub(new Date(), {days: 200}), fechaFin: sub(new Date(), {days: 5}) },
];

export let mockTrabajadores: Trabajador[] = [
  { id: MOCK_TRABAJADOR_ID_1, nombre: 'Mohamed Elhamri', subcontrataId: MOCK_SUBCONTRATA_ID, codigoAcceso: '111111', proyectosAsignados: [MOCK_PROYECTO_ID_1, MOCK_PROYECTO_ID_2], categoriaProfesional: 'maquinista' },
  { id: MOCK_TRABAJADOR_ID_2, nombre: 'Ana García López', subcontrataId: MOCK_SUBCONTRATA_ID, codigoAcceso: '222222', proyectosAsignados: [MOCK_PROYECTO_ID_1], categoriaProfesional: 'oficial' },
  { id: MOCK_TRABAJADOR_ID_3, nombre: 'David Ruiz Soler', subcontrataId: MOCK_SUBCONTRATA_ID, codigoAcceso: '333333', proyectosAsignados: [MOCK_PROYECTO_ID_1], categoriaProfesional: 'peon' },
  { id: 'trab-04-mock', nombre: 'Lucía Martín', subcontrataId: 'sub-estructuras-sl', codigoAcceso: '444444', proyectosAsignados: ['proy-finalizado'], categoriaProfesional: 'encofrador' },
];

export let mockMaquinaria: Maquinaria[] = [
    { id: 'maq-01-mock', subcontrataId: MOCK_SUBCONTRATA_ID, nombre: 'Retroexcavadora CAT 320', matriculaORef: 'E-1234-BCN', proyectosAsignados: [MOCK_PROYECTO_ID_1] },
    { id: 'maq-02-mock', subcontrataId: MOCK_SUBCONTRATA_ID, nombre: 'Furgoneta Ford Transit', matriculaORef: '5678-JFK', proyectosAsignados: [MOCK_PROYECTO_ID_1, MOCK_PROYECTO_ID_2] },
    { id: 'maq-03-mock', subcontrataId: 'sub-estructuras-sl', nombre: 'Grúa Torre', matriculaORef: 'GT-500', proyectosAsignados: [] },
];

export let mockReportesDiarios: ReporteDiario[] = [
    {
        id: 'rep-01',
        proyectoId: MOCK_PROYECTO_ID_1,
        fecha: sub(new Date(), { days: 1 }),
        encargadoId: MOCK_ENCARGADO_ID,
        trabajadores: [
            { trabajadorId: MOCK_TRABAJADOR_ID_1, nombre: 'Mohamed Elhamri', asistencia: true, horas: 8 },
            { trabajadorId: MOCK_TRABAJADOR_ID_2, nombre: 'Ana García López', asistencia: true, horas: 8 },
            { trabajadorId: MOCK_TRABAJADOR_ID_3, nombre: 'David Ruiz Soler', asistencia: false, horas: 0 },
        ],
        comentarios: "Jornada sin incidencias. Se ha completado el replanteo de la zona sur.",
        timestamp: sub(new Date(), { days: 1 }),
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 1 }) },
            subcontrata: { validado: false, timestamp: null },
            constructora: { validado: false, timestamp: null },
        }
    },
    {
        id: 'rep-02',
        proyectoId: MOCK_PROYECTO_ID_1,
        fecha: sub(new Date(), { days: 2 }),
        encargadoId: MOCK_ENCARGADO_ID,
        trabajadores: [
            { trabajadorId: MOCK_TRABAJADOR_ID_1, nombre: 'Mohamed Elhamri', asistencia: true, horas: 8 },
            { trabajadorId: MOCK_TRABAJADOR_ID_2, nombre: 'Ana García López', asistencia: true, horas: 4 },
        ],
        comentarios: "Ana García se retiró a mediodía por indisposición. Se avanzó en la excavación.",
        timestamp: sub(new Date(), { days: 2 }),
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 2 }) },
            subcontrata: { validado: true, timestamp: sub(new Date(), { days: 1 }) },
            constructora: { validado: false, timestamp: null },
        }
    },
     {
        id: 'rep-03',
        proyectoId: MOCK_PROYECTO_ID_2,
        fecha: sub(new Date(), { days: 1 }),
        encargadoId: MOCK_ENCARGADO_ID,
        trabajadores: [
            { trabajadorId: MOCK_TRABAJADOR_ID_1, nombre: 'Mohamed Elhamri', asistencia: true, horas: 7 },
        ],
        comentarios: "Inicio de demoliciones interiores en planta 2.",
        timestamp: sub(new Date(), { days: 1 }),
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 1 }) },
            subcontrata: { validado: false, timestamp: null },
            constructora: { validado: false, timestamp: null },
        }
    },
];

export let mockFichajes: any[] = [];
