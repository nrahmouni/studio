
import type { Fichaje } from '@/lib/types';

const today = new Date();
const yesterday = new Date(new Date().setDate(today.getDate() - 1));
const dayBeforeYesterday = new Date(new Date().setDate(today.getDate() - 2));

export const mockFichajes: Fichaje[] = [
  // --- Fichajes existentes ---
  {
    id: 'fichaje-1',
    usuarioId: 'user-1-trabajador-1', // Lucía Fernández
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    tipo: 'entrada',
    timestamp: new Date(new Date(yesterday).setHours(8, 0, 0, 0)), 
    validado: true,
    validadoPor: 'user-1-jefeobra-1', // Carlos López
  },
  {
    id: 'fichaje-2',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-1',
    tipo: 'inicioDescanso',
    timestamp: new Date(new Date(yesterday).setHours(12, 0, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-1',
  },
  {
    id: 'fichaje-3',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-1',
    tipo: 'finDescanso',
    timestamp: new Date(new Date(yesterday).setHours(12, 30, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-1',
  },
   {
    id: 'fichaje-3b', // salida para completar el día de Lucía
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-1',
    tipo: 'salida',
    timestamp: new Date(new Date(yesterday).setHours(17, 0, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-1',
  },
  {
    id: 'fichaje-4',
    usuarioId: 'user-1-trabajador-2', // Marcos García
    obraId: 'obra-1-2', // Construcción Nave Industrial
    tipo: 'entrada',
    timestamp: new Date(new Date(yesterday).setHours(9, 15, 0, 0)), 
    validado: true,
    validadoPor: 'user-1-jefeobra-2', // Elena García
  },
  {
    id: 'fichaje-4b', // Salida para Marcos
    usuarioId: 'user-1-trabajador-2', 
    obraId: 'obra-1-2',
    tipo: 'salida',
    timestamp: new Date(new Date(yesterday).setHours(18, 0, 0, 0)), 
    validado: true,
    validadoPor: 'user-1-jefeobra-2', 
  },
  {
    id: 'fichaje-5',
    usuarioId: 'user-2-trabajador-1', // David Sanz
    obraId: 'obra-2-1', // Adecuación Local Comercial
    tipo: 'entrada',
    timestamp: new Date(new Date(dayBeforeYesterday).setHours(8, 30, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-6',
    usuarioId: 'user-2-trabajador-1',
    obraId: 'obra-2-1',
    tipo: 'salida',
    timestamp: new Date(new Date(dayBeforeYesterday).setHours(17, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },

  // --- Nuevos Fichajes Hoy (para tener datos pendientes) ---
  // Javier Soler (user-1-trabajador-3) en obra-1-1 (Jefe: Carlos López)
  {
    id: 'fichaje-7',
    usuarioId: 'user-1-trabajador-3',
    obraId: 'obra-1-1',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(7, 55, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-8',
    usuarioId: 'user-1-trabajador-3',
    obraId: 'obra-1-1',
    tipo: 'inicioDescanso',
    timestamp: new Date(new Date(today).setHours(11, 30, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  // Sofía Navarro (user-1-trabajador-4) en obra-1-3 (Jefe: Carlos López)
  {
    id: 'fichaje-9',
    usuarioId: 'user-1-trabajador-4',
    obraId: 'obra-1-3',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 10, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  // Marcos García (user-1-trabajador-2) en obra-1-4 (Jefe: Elena García)
   {
    id: 'fichaje-10',
    usuarioId: 'user-1-trabajador-2',
    obraId: 'obra-1-4',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 45, 0, 0)),
    validado: false,
    validadoPor: null,
  },
   {
    id: 'fichaje-11',
    usuarioId: 'user-1-trabajador-2',
    obraId: 'obra-1-4',
    tipo: 'salida',
    timestamp: new Date(new Date(today).setHours(13, 5, 0, 0)), // Media jornada
    validado: false,
    validadoPor: null,
  },
  // Lucía Fernández (user-1-trabajador-1) en obra-1-3 (Jefe: Carlos López)
  {
    id: 'fichaje-12',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-3',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 20, 0, 0)),
    validado: false,
    validadoPor: null,
  },

  // --- Fichajes de Ayer para más variedad ---
  // Javier Soler (user-1-trabajador-3) en obra-1-2 (Jefe: Elena García)
  {
    id: 'fichaje-13',
    usuarioId: 'user-1-trabajador-3',
    obraId: 'obra-1-2',
    tipo: 'entrada',
    timestamp: new Date(new Date(yesterday).setHours(8, 0, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-2',
  },
  {
    id: 'fichaje-14',
    usuarioId: 'user-1-trabajador-3',
    obraId: 'obra-1-2',
    tipo: 'salida',
    timestamp: new Date(new Date(yesterday).setHours(17, 30, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-2',
  },
  // Sofía Navarro (user-1-trabajador-4) en obra-1-4 (Jefe: Elena García)
  {
    id: 'fichaje-15',
    usuarioId: 'user-1-trabajador-4',
    obraId: 'obra-1-4',
    tipo: 'entrada',
    timestamp: new Date(new Date(yesterday).setHours(9, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-16',
    usuarioId: 'user-1-trabajador-4',
    obraId: 'obra-1-4',
    tipo: 'salida',
    timestamp: new Date(new Date(yesterday).setHours(18, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },
];

