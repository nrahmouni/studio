
import type { Obra } from '@/lib/types';

export const mockObras: Obra[] = [
  {
    id: 'obra-1-1',
    empresaId: 'empresa-1',
    nombre: 'Reforma Integral Ático Sol',
    direccion: 'Calle Mayor, 1, Madrid',
    fechaInicio: new Date('2024-05-10'),
    fechaFin: new Date('2024-08-30'),
    clienteNombre: 'Ana Pérez',
    jefeObraId: 'user-1-jefeobra',
    costosPorCategoria: [
      { id: 'costo-1', categoria: 'Fontanería', costo: 1200.50, notas: 'Materiales y mano de obra baño principal' },
      { id: 'costo-2', categoria: 'Alicatado', costo: 850.00, notas: 'Azulejos y colocación cocina' },
    ],
    dataAIHint: 'apartment renovation',
  },
  {
    id: 'obra-1-2',
    empresaId: 'empresa-1',
    nombre: 'Construcción Nave Industrial Logística',
    direccion: 'Polígono Industrial Las Mercedes, Parcela 22, Getafe',
    fechaInicio: new Date('2024-03-01'),
    fechaFin: null, // En curso
    clienteNombre: 'Logistics Solutions S.A.',
    costosPorCategoria: [
      { id: 'costo-3', categoria: 'Estructura Metálica', costo: 25000, notas: 'Acero y montaje sector A y B' },
    ],
    dataAIHint: 'industrial warehouse',
  },
  {
    id: 'obra-1-3',
    empresaId: 'empresa-1',
    nombre: 'Rehabilitación Fachada Edificio Histórico',
    direccion: 'Plaza de la Villa, 5, Madrid',
    fechaInicio: new Date('2024-07-15'),
    fechaFin: new Date('2024-12-20'),
    clienteNombre: 'Comunidad de Propietarios Plaza Villa',
    jefeObraId: 'user-1-jefeobra',
    costosPorCategoria: [],
    dataAIHint: 'historic building facade',
  },
  {
    id: 'obra-2-1',
    empresaId: 'empresa-2',
    nombre: 'Adecuación Local Comercial para Franquicia',
    direccion: 'Avenida Diagonal, 200, Barcelona',
    fechaInicio: new Date('2024-06-01'),
    fechaFin: new Date('2024-07-30'),
    clienteNombre: 'Franquicias XYZ',
    costosPorCategoria: [
        { id: 'costo-4', categoria: 'Pladur', costo: 1500, notas: 'Divisiones interiores' },
        { id: 'costo-5', categoria: 'Pintura', costo: 700 },
    ],
    dataAIHint: 'retail store setup',
  },
  {
    id: 'obra-3-1',
    empresaId: 'empresa-3',
    nombre: 'Edificio Residencial "Mirador del Parque"',
    direccion: 'Calle de la Innovación, 10, Valencia',
    fechaInicio: new Date('2023-11-01'),
    fechaFin: new Date('2025-06-30'),
    clienteNombre: 'Promociones Urbanas Futuro',
    jefeObraId: 'user-3-jefeobra',
    costosPorCategoria: [],
    dataAIHint: 'residential building construction',
  },
  {
    id: 'obra-3-2',
    empresaId: 'empresa-3',
    nombre: 'Pintura y Acabados Chalet Lujo',
    direccion: 'Urbanización Los Pinos, 45, Marbella',
    fechaInicio: new Date('2024-08-01'),
    fechaFin: null,
    clienteNombre: 'Familia Rodriguez',
    costosPorCategoria: [],
    dataAIHint: 'luxury villa painting',
  }
];

