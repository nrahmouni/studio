// src/lib/mockData.ts
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria } from '@/lib/types';
import { sub, add } from 'date-fns';

// Minimal data set to ensure seeding is fast and avoids timeouts.

export const mockConstructoras: Constructora[] = [
    { id: 'const-sorigui-mock', nombre: 'Constructora Sorigui' },
];

export const mockSubcontratas: Subcontrata[] = [
  { id: 'sub-caram-mock', nombre: 'Excavaciones Caram', clientesConstructoraIds: ['const-sorigui-mock'] },
];

export const mockProyectos: Proyecto[] = [
  { id: 'proy-meridiana', nombre: 'Reforma Av. Meridiana', constructoraId: 'const-sorigui-mock', subcontrataId: 'sub-caram-mock', direccion: 'Avinguda Meridiana, 350, Barcelona', clienteNombre: 'Ayuntamiento de Barcelona', fechaInicio: sub(new Date(), {days: 10}), fechaFin: add(new Date(), {days: 60}) },
];

export const mockTrabajadores: Trabajador[] = [
  { id: 'trab-01', nombre: 'Mohamed Elhamri', subcontrataId: 'sub-caram-mock', codigoAcceso: '111111', proyectosAsignados: ['proy-meridiana'], categoriaProfesional: 'maquinista' },
];

// Empty arrays for the rest to minimize the batch operation
export const mockMaquinaria: Maquinaria[] = [];

export const mockReportesDiarios: ReporteDiario[] = [];
