// src/lib/mockData.ts
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria } from '@/lib/types';
import { sub, add } from 'date-fns';

// Simplified data set to ensure fast seeding and avoid timeouts.

export const mockConstructoras: Constructora[] = [
    { id: 'const-sorigui-mock', nombre: 'Constructora Sorigui' },
];

export const mockSubcontratas: Subcontrata[] = [
  { id: 'sub-caram-mock', nombre: 'Excavaciones Caram', clientesConstructoraIds: ['const-sorigui-mock'] },
];

export const mockProyectos: Proyecto[] = [
  { id: 'proy-meridiana', nombre: 'Reforma Av. Meridiana', constructoraId: 'const-sorigui-mock', subcontrataId: 'sub-caram-mock', direccion: 'Avinguda Meridiana, 350, Barcelona', clienteNombre: 'Ayuntamiento de Barcelona', fechaInicio: sub(new Date(), {days: 30}), fechaFin: add(new Date(), {days: 90}) },
  { id: 'proy-marina', nombre: 'Edificio C/ Marina', constructoraId: 'const-sorigui-mock', subcontrataId: 'sub-caram-mock', direccion: 'Carrer de la Marina, 120, Barcelona', clienteNombre: 'Inversiones FJP', fechaInicio: new Date(), fechaFin: add(new Date(), {months: 6}) },
];

export const mockTrabajadores: Trabajador[] = [
  { id: 'trab-01', nombre: 'Mohamed Elhamri', subcontrataId: 'sub-caram-mock', codigoAcceso: '111111', proyectosAsignados: ['proy-meridiana'], categoriaProfesional: 'maquinista' },
  { id: 'trab-02', nombre: 'Juan García', subcontrataId: 'sub-caram-mock', codigoAcceso: '222222', proyectosAsignados: ['proy-meridiana', 'proy-marina'], categoriaProfesional: 'oficial' },
  { id: 'trab-03', nombre: 'Ana López', subcontrataId: 'sub-caram-mock', codigoAcceso: '333333', proyectosAsignados: [], categoriaProfesional: 'peon' },
];

export const mockMaquinaria: Maquinaria[] = [
    { id: 'maq-01', subcontrataId: 'sub-caram-mock', nombre: 'Retroexcavadora CAT 320', matriculaORef: 'E-1234-BCD', proyectosAsignados: ['proy-meridiana'] },
];

export const mockReportesDiarios: ReporteDiario[] = [
    {
        id: 'rep-001',
        proyectoId: 'proy-meridiana',
        fecha: sub(new Date(), { days: 1 }),
        encargadoId: 'user-encargado-mock',
        trabajadores: [
            { trabajadorId: 'trab-01', nombre: 'Mohamed Elhamri', asistencia: true, horas: 8 },
            { trabajadorId: 'trab-02', nombre: 'Juan García', asistencia: true, horas: 9 },
        ],
        timestamp: sub(new Date(), { days: 1, hours: 2 }),
        comentarios: "Todo en orden, el material llegó a tiempo.",
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 1, hours: 2 }) },
            subcontrata: { validado: false, timestamp: null },
            constructora: { validado: false, timestamp: null },
        },
        modificacionJefeObra: {
            modificado: false,
            jefeObraId: null,
            timestamp: null,
            reporteOriginal: null,
        }
    },
    {
        id: 'rep-002',
        proyectoId: 'proy-marina',
        fecha: sub(new Date(), { days: 2 }),
        encargadoId: 'user-encargado-mock',
        trabajadores: [
            { trabajadorId: 'trab-02', nombre: 'Juan García', asistencia: true, horas: 8 },
        ],
        timestamp: sub(new Date(), { days: 2, hours: 3 }),
        comentarios: null,
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 2, hours: 3 }) },
            subcontrata: { validado: true, timestamp: sub(new Date(), { days: 2, hours: 1 }) },
            constructora: { validado: false, timestamp: null },
        },
        modificacionJefeObra: null,
    },
];