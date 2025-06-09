
import type { Fichaje } from '@/lib/types';

const today = new Date();
const yesterday = new Date(new Date().setDate(today.getDate() - 1));
const dayBeforeYesterday = new Date(new Date().setDate(today.getDate() - 2));
const threeDaysAgo = new Date(new Date().setDate(today.getDate() - 3));
const lastWeek = new Date(new Date().setDate(today.getDate() - 7));


export const mockFichajes: Fichaje[] = [
  // --- Fichajes existentes ---
  {
    id: 'fichaje-1',
    usuarioId: 'user-1-trabajador-1', // Lucía Fernández
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    tipo: 'entrada',
    timestamp: new Date(new Date(yesterday).setHours(8, 0, 0, 0)), 
    validado: true,
    validadoPor: 'user-1-jefeobra-1', 
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
    id: 'fichaje-3b', 
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
    validadoPor: 'user-1-jefeobra-2', 
  },
  {
    id: 'fichaje-4b', 
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
  {
    id: 'fichaje-9',
    usuarioId: 'user-1-trabajador-4',
    obraId: 'obra-1-3',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 10, 0, 0)),
    validado: false,
    validadoPor: null,
  },
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
    timestamp: new Date(new Date(today).setHours(13, 5, 0, 0)), 
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-12',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-3',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 20, 0, 0)),
    validado: false,
    validadoPor: null,
  },
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
  // --- Nuevos Fichajes ---
  // Trabajador: user-1-trabajador-6 (Andrea Gil), Obra: obra-1-5 (Vivienda Unifamiliar), Jefe: user-1-jefeobra-1 (Carlos López)
  {
    id: 'fichaje-17',
    usuarioId: 'user-1-trabajador-6',
    obraId: 'obra-1-5',
    tipo: 'entrada',
    timestamp: new Date(new Date(lastWeek).setHours(8, 15, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-1',
  },
  {
    id: 'fichaje-18',
    usuarioId: 'user-1-trabajador-6',
    obraId: 'obra-1-5',
    tipo: 'salida',
    timestamp: new Date(new Date(lastWeek).setHours(17, 45, 0, 0)),
    validado: true,
    validadoPor: 'user-1-jefeobra-1',
  },
  // Trabajador: user-1-trabajador-7 (Sergio Peña), Obra: obra-1-6 (Parking Subterráneo), Jefe: user-1-jefeobra-3 (Roberto Sanz)
  {
    id: 'fichaje-19',
    usuarioId: 'user-1-trabajador-7',
    obraId: 'obra-1-6',
    tipo: 'entrada',
    timestamp: new Date(new Date(threeDaysAgo).setHours(7, 30, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-20',
    usuarioId: 'user-1-trabajador-7',
    obraId: 'obra-1-6',
    tipo: 'inicioDescanso',
    timestamp: new Date(new Date(threeDaysAgo).setHours(10, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-21',
    usuarioId: 'user-1-trabajador-7',
    obraId: 'obra-1-6',
    tipo: 'finDescanso',
    timestamp: new Date(new Date(threeDaysAgo).setHours(10, 30, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-22',
    usuarioId: 'user-1-trabajador-7',
    obraId: 'obra-1-6',
    tipo: 'salida',
    timestamp: new Date(new Date(threeDaysAgo).setHours(16, 30, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  // Trabajador: user-2-trabajador-3 (Carlos Ruiz), Obra: obra-2-3 (Impermeabilización Cubierta), Jefe: user-2-jefeobra-2 (Mónica Vidal)
  {
    id: 'fichaje-23',
    usuarioId: 'user-2-trabajador-3',
    obraId: 'obra-2-3',
    tipo: 'entrada',
    timestamp: new Date(new Date(yesterday).setHours(9, 0, 0, 0)),
    validado: true,
    validadoPor: 'user-2-jefeobra-2',
  },
  {
    id: 'fichaje-24',
    usuarioId: 'user-2-trabajador-3',
    obraId: 'obra-2-3',
    tipo: 'salida',
    timestamp: new Date(new Date(yesterday).setHours(18, 0, 0, 0)),
    validado: true,
    validadoPor: 'user-2-jefeobra-2',
  },
  // Trabajador: user-3-trabajador-3 (Isabel Roca), Obra: obra-3-4 (Centro Deportivo), Jefe: user-3-jefeobra-3 (Javier Martín)
  {
    id: 'fichaje-25',
    usuarioId: 'user-3-trabajador-3',
    obraId: 'obra-3-4',
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-26',
    usuarioId: 'user-3-trabajador-3', // Isabel Roca abandona antes
    obraId: 'obra-3-4',
    tipo: 'salida',
    timestamp: new Date(new Date(today).setHours(14, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  // Más fichajes para hoy para tener activos
  {
    id: 'fichaje-27',
    usuarioId: 'user-1-trabajador-1', // Lucía Fernández
    obraId: 'obra-1-5', // Vivienda Unifamiliar (JO: Carlos López user-1-jefeobra-1)
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(8, 30, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-28',
    usuarioId: 'user-2-trabajador-1', // David Sanz
    obraId: 'obra-2-2', // Reforma Cocina (JO: Ricardo Montes user-2-jefeobra-1)
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(9, 10, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-29',
    usuarioId: 'user-2-trabajador-1',
    obraId: 'obra-2-2',
    tipo: 'inicioDescanso',
    timestamp: new Date(new Date(today).setHours(13, 0, 0, 0)),
    validado: false,
    validadoPor: null,
  },
  {
    id: 'fichaje-30',
    usuarioId: 'user-3-trabajador-2', // Pedro Ramos
    obraId: 'obra-3-3', // Paneles Solares (JO: Miguel Torres user-3-jefeobra-1)
    tipo: 'entrada',
    timestamp: new Date(new Date(today).setHours(7, 45, 0, 0)),
    validado: false,
    validadoPor: null,
  },
];
