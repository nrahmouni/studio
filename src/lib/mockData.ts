// src/lib/mockData.ts
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria } from '@/lib/types';
import { sub, add } from 'date-fns';

export const mockConstructoras: Constructora[] = [
    { id: 'const-sorigui-mock', nombre: 'Constructora Sorigui' },
    { id: 'const-acciona-mock', nombre: 'Acciona' },
    { id: 'const-axa-mock', nombre: 'AXA Seguros (cliente final)' },
];

export const mockSubcontratas: Subcontrata[] = [
  { id: 'sub-caram-mock', nombre: 'Excavaciones Caram', clientesConstructoraIds: ['const-sorigui-mock', 'const-acciona-mock'] },
  { id: 'sub-perez-mock', nombre: 'Estructuras Pérez', clientesConstructoraIds: ['const-sorigui-mock'] },
  { id: 'sub-volta-mock', nombre: 'Electricidad Volta', clientesConstructoraIds: ['const-axa-mock'] },
];

export const mockProyectos: Proyecto[] = [
  { id: 'proy-meridiana', nombre: 'Reforma Av. Meridiana', constructoraId: 'const-sorigui-mock', subcontrataId: 'sub-caram-mock', direccion: 'Avinguda Meridiana, 350, Barcelona', clienteNombre: 'Ayuntamiento de Barcelona', fechaInicio: sub(new Date(), {days: 30}), fechaFin: add(new Date(), {days: 90}) },
  { id: 'proy-glorias', nombre: 'Oficinas Pl. Glorias', constructoraId: 'const-acciona-mock', subcontrataId: 'sub-caram-mock', direccion: 'Plaça de les Glòries Catalanes, 37, Barcelona', clienteNombre: 'Competence Co.', fechaInicio: sub(new Date(), {days: 60}), fechaFin: add(new Date(), {days: 120}) },
  { id: 'proy-marina', nombre: 'Edificio C/ Marina', constructoraId: 'const-sorigui-mock', subcontrataId: 'sub-perez-mock', direccion: 'Carrer de la Marina, 120, Barcelona', clienteNombre: 'Inversiones FJP', fechaInicio: new Date(), fechaFin: add(new Date(), {months: 6}) },
  { id: 'proy-oficina-axa', nombre: 'Sede Central AXA', constructoraId: 'const-axa-mock', subcontrataId: 'sub-volta-mock', direccion: 'Avinguda Diagonal, 547, Barcelona', clienteNombre: 'AXA Seguros', fechaInicio: sub(new Date(), {days: 15}), fechaFin: add(new Date(), {months: 1}) },
];

export const mockTrabajadores: Trabajador[] = [
  // Caram - Meridiana
  { id: 'trab-01', nombre: 'Mohamed Elhamri', subcontrataId: 'sub-caram-mock', codigoAcceso: '111111', proyectosAsignados: ['proy-meridiana'], categoriaProfesional: 'maquinista' },
  { id: 'trab-02', nombre: 'Juan García', subcontrataId: 'sub-caram-mock', codigoAcceso: '222222', proyectosAsignados: ['proy-meridiana'], categoriaProfesional: 'oficial' },
  { id: 'trab-03', nombre: 'Ana López', subcontrataId: 'sub-caram-mock', codigoAcceso: '333333', proyectosAsignados: ['proy-meridiana'], categoriaProfesional: 'peon' },
  
  // Caram - Glorias
  { id: 'trab-04', nombre: 'Lucía Fernández', subcontrataId: 'sub-caram-mock', codigoAcceso: '444444', proyectosAsignados: ['proy-glorias'], categoriaProfesional: 'oficial' },
  
  // Pérez - Marina
  { id: 'trab-05', nombre: 'Pedro Sánchez', subcontrataId: 'sub-perez-mock', codigoAcceso: '555555', proyectosAsignados: ['proy-marina'], categoriaProfesional: 'encofrador' },
  { id: 'trab-06', nombre: 'Ana Martínez', subcontrataId: 'sub-perez-mock', codigoAcceso: '666666', proyectosAsignados: ['proy-marina'], categoriaProfesional: 'oficial' },

  // Volta - AXA
  { id: 'trab-07', nombre: 'Carlos Ruiz', subcontrataId: 'sub-volta-mock', codigoAcceso: '777777', proyectosAsignados: ['proy-oficina-axa'], categoriaProfesional: 'oficial' },
];

export const mockMaquinaria: Maquinaria[] = [
    { id: 'maq-01', subcontrataId: 'sub-caram-mock', nombre: 'Retroexcavadora CAT 320', matriculaORef: 'E-1234-BCD' },
    { id: 'maq-02', subcontrataId: 'sub-caram-mock', nombre: 'Minicargadora Bobcat S70', matriculaORef: 'REF-MC-001' },
    { id: 'maq-03', subcontrataId: 'sub-perez-mock', nombre: 'Grúa Torre Liebherr', matriculaORef: 'GR-LB-550' },
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
        encargadoId: 'user-encargado-mock-2',
        trabajadores: [
            { trabajadorId: 'trab-05', nombre: 'Pedro Sánchez', asistencia: true, horas: 8 },
            { trabajadorId: 'trab-06', nombre: 'Ana Martínez', asistencia: true, horas: 8 },
        ],
        timestamp: sub(new Date(), { days: 2, hours: 3 }),
        comentarios: null,
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 2, hours: 3 }) },
            subcontrata: { validado: true, timestamp: sub(new Date(), { days: 2, hours: 1 }) },
            constructora: { validado: false, timestamp: null },
        },
        modificacionJefeObra: {
            modificado: true,
            jefeObraId: 'jefe-obra-mock-id',
            timestamp: sub(new Date(), { days: 1 }),
            reporteOriginal: '[]'
        }
    },
    {
        id: 'rep-003',
        proyectoId: 'proy-glorias',
        fecha: sub(new Date(), { days: 3 }),
        encargadoId: 'user-encargado-mock',
        trabajadores: [
            { trabajadorId: 'trab-04', nombre: 'Lucía Fernández', asistencia: true, horas: 8 },
        ],
        timestamp: sub(new Date(), { days: 3, hours: 5 }),
        comentarios: "Se ha solicitado una grúa para la próxima semana.",
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 3, hours: 5 }) },
            subcontrata: { validado: true, timestamp: sub(new Date(), { days: 3, hours: 2 }) },
            constructora: { validado: true, timestamp: sub(new Date(), { days: 2 }) },
        },
        modificacionJefeObra: {
            modificado: false,
            jefeObraId: null,
            timestamp: null,
            reporteOriginal: null,
        }
    },
    {
        id: 'rep-004',
        proyectoId: 'proy-meridiana',
        fecha: new Date(),
        encargadoId: 'user-encargado-mock',
        trabajadores: [
            { trabajadorId: 'trab-01', nombre: 'Mohamed Elhamri', asistencia: true, horas: 8 },
            { trabajadorId: 'trab-02', nombre: 'Juan García', asistencia: true, horas: 8 },
        ],
        timestamp: new Date(),
        comentarios: null,
        validacion: {
            encargado: { validado: true, timestamp: new Date() },
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
        id: 'rep-005',
        proyectoId: 'proy-oficina-axa',
        fecha: sub(new Date(), { days: 5 }),
        encargadoId: 'user-encargado-mock-3',
        trabajadores: [
            { trabajadorId: 'trab-07', nombre: 'Carlos Ruiz', asistencia: true, horas: 10 },
        ],
        timestamp: sub(new Date(), { days: 5, hours: 1 }),
        comentarios: "Trabajo extra realizado para cumplir con el plazo. Se necesita validar horas extra.",
        validacion: {
            encargado: { validado: true, timestamp: sub(new Date(), { days: 5, hours: 1 }) },
            subcontrata: { validado: true, timestamp: sub(new Date(), { days: 4 }) },
            constructora: { validado: false, timestamp: null },
        },
        modificacionJefeObra: {
            modificado: false,
            jefeObraId: null,
            timestamp: null,
            reporteOriginal: null,
        }
    }
];
