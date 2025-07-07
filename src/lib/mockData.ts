// src/lib/mockData.ts
import type { Subcontrata, Proyecto, Trabajador } from '@/lib/types';

export const mockSubcontratas: Subcontrata[] = [
  { id: 'sub-caram', nombre: 'Excavaciones Caram', clientesConstructoraIds: ['const-sorigui', 'const-acciona'] },
  { id: 'sub-perez', nombre: 'Estructuras Pérez', clientesConstructoraIds: ['const-sorigui'] },
  { id: 'sub-volta', nombre: 'Electricidad Volta', clientesConstructoraIds: ['const-axa'] },
];

export const mockProyectos: Proyecto[] = [
  { id: 'proy-meridiana', nombre: 'Reforma Av. Meridiana', constructoraId: 'const-sorigui', subcontrataId: 'sub-caram' },
  { id: 'proy-glorias', nombre: 'Oficinas Pl. Glorias', constructoraId: 'const-acciona', subcontrataId: 'sub-caram' },
  { id: 'proy-marina', nombre: 'Edificio C/ Marina', constructoraId: 'const-sorigui', subcontrataId: 'sub-perez' },
  { id: 'proy-oficina-axa', nombre: 'Sede Central AXA', constructoraId: 'const-axa', subcontrataId: 'sub-volta' },
];

export const mockTrabajadores: Trabajador[] = [
  // Caram - Meridiana
  { id: 'trab-01', nombre: 'Mohamed Elhamri', subcontrataId: 'sub-caram', codigoAcceso: '111111', proyectosAsignados: ['proy-meridiana'] },
  { id: 'trab-02', nombre: 'Juan García', subcontrataId: 'sub-caram', codigoAcceso: '222222', proyectosAsignados: ['proy-meridiana'] },
  { id: 'trab-03', nombre: 'Ana López', subcontrataId: 'sub-caram', codigoAcceso: '333333', proyectosAsignados: ['proy-meridiana'] },
  
  // Caram - Glorias
  { id: 'trab-04', nombre: 'Lucía Fernández', subcontrataId: 'sub-caram', codigoAcceso: '444444', proyectosAsignados: ['proy-glorias'] },
  
  // Pérez - Marina
  { id: 'trab-05', nombre: 'Pedro Sánchez', subcontrataId: 'sub-perez', codigoAcceso: '555555', proyectosAsignados: ['proy-marina'] },
  { id: 'trab-06', nombre: 'Ana Martínez', subcontrataId: 'sub-perez', codigoAcceso: '666666', proyectosAsignados: ['proy-marina'] },

  // Volta - AXA
  { id: 'trab-07', nombre: 'Carlos Ruiz', subcontrataId: 'sub-volta', codigoAcceso: '777777', proyectosAsignados: ['proy-oficina-axa'] },
];
