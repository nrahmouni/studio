
import type { Fichaje } from '@/lib/types';

export const mockFichajes: Fichaje[] = [
  {
    id: 'fichaje-1',
    usuarioId: 'user-1-trabajador-1', // Lucía Fernández
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    tipo: 'entrada',
    timestamp: new Date(new Date().setHours(8, 0, 0, 0)), // Today at 8:00 AM
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-2',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-1',
    tipo: 'inicioDescanso',
    timestamp: new Date(new Date().setHours(12, 0, 0, 0)), // Today at 12:00 PM
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-3',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-1',
    tipo: 'finDescanso',
    timestamp: new Date(new Date().setHours(12, 30, 0, 0)), // Today at 12:30 PM
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-4',
    usuarioId: 'user-1-trabajador-2', // Marcos García
    obraId: 'obra-1-2', // Construcción Nave Industrial
    tipo: 'entrada',
    timestamp: new Date(new Date().setHours(9, 15, 0, 0)), // Today at 9:15 AM
    validado: true,
    validadoPor: 'user-1-jefeobra', // Carlos López
  },
  {
    id: 'fichaje-5',
    usuarioId: 'user-2-trabajador-1', // David Sanz
    obraId: 'obra-2-1', // Adecuación Local Comercial
    tipo: 'entrada',
    timestamp: new Date(new Date(new Date().setDate(new Date().getDate() -1)).setHours(8, 30, 0, 0)), // Yesterday at 8:30 AM
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-6',
    usuarioId: 'user-2-trabajador-1',
    obraId: 'obra-2-1',
    tipo: 'salida',
    timestamp: new Date(new Date(new Date().setDate(new Date().getDate() -1)).setHours(17, 0, 0, 0)), // Yesterday at 5:00 PM
    validado: false,
    validadoPor: null,
  },
];
