
import type { Obra } from '@/lib/types';

export const mockObras: Obra[] = [
  // --- Obras para Construcciones Modernas S.L. (empresa-1) ---
  {
    id: 'obra-1-1',
    empresaId: 'empresa-1',
    nombre: 'Reforma Integral Ático Sol',
    direccion: 'Calle Mayor, 1, Madrid',
    fechaInicio: new Date('2024-05-10'),
    fechaFin: new Date('2024-09-30'), 
    clienteNombre: 'Ana Pérez',
    jefeObraId: 'user-1-jefeobra-1', 
    costosPorCategoria: [
      { id: 'costo-1-1-1', categoria: 'Fontanería', costo: 1250.75, notas: 'Materiales y mano de obra baño principal y cocina' },
      { id: 'costo-1-1-2', categoria: 'Alicatado', costo: 950.00, notas: 'Azulejos y colocación cocina y baño' },
      { id: 'costo-1-1-3', categoria: 'Electricidad', costo: 700.00, notas: 'Nuevos puntos de luz y mecanismos' },
    ],
    dataAIHint: 'apartment renovation',
  },
  {
    id: 'obra-1-2',
    empresaId: 'empresa-1',
    nombre: 'Construcción Nave Industrial Logística',
    direccion: 'Polígono Industrial Las Mercedes, Parcela 22, Getafe',
    fechaInicio: new Date('2024-03-01'),
    fechaFin: null, 
    clienteNombre: 'Logistics Solutions S.A.',
    jefeObraId: 'user-1-jefeobra-2', 
    costosPorCategoria: [
      { id: 'costo-1-2-1', categoria: 'Cimentación', costo: 15000, notas: 'Excavación y hormigonado' },
      { id: 'costo-1-2-2', categoria: 'Estructura Metálica', costo: 28000, notas: 'Acero y montaje sector A, B y C' },
    ],
    dataAIHint: 'industrial warehouse',
  },
  {
    id: 'obra-1-3',
    empresaId: 'empresa-1',
    nombre: 'Rehabilitación Fachada Edificio Histórico',
    direccion: 'Plaza de la Villa, 5, Madrid',
    fechaInicio: new Date('2024-07-15'),
    fechaFin: null, 
    clienteNombre: 'Comunidad de Propietarios Plaza Villa',
    jefeObraId: 'user-1-jefeobra-1', 
    costosPorCategoria: [],
    dataAIHint: 'historic building facade',
  },
  { 
    id: 'obra-1-4',
    empresaId: 'empresa-1',
    nombre: 'Ampliación Oficinas Centrales TechCorp',
    direccion: 'Paseo de la Castellana, 150, Madrid',
    fechaInicio: new Date('2024-09-01'),
    fechaFin: new Date('2025-02-28'),
    clienteNombre: 'TechCorp Innovations',
    jefeObraId: 'user-1-jefeobra-2', 
    costosPorCategoria: [
      { id: 'costo-1-4-1', categoria: 'Mamparas y Divisiones', costo: 9500, notas: 'Cristal y perfiles de aluminio' },
      { id: 'costo-1-4-2', categoria: 'Suelo Técnico', costo: 6000, notas: 'Instalación completa planta 3' },
    ],
    dataAIHint: 'office expansion',
  },
  { // Nueva obra para Empresa 1
    id: 'obra-1-5',
    empresaId: 'empresa-1',
    nombre: 'Vivienda Unifamiliar "El Mirador"',
    direccion: 'Urbanización Monte Real, Lote 12, Pozuelo',
    fechaInicio: new Date('2024-10-01'),
    fechaFin: new Date('2025-08-30'),
    clienteNombre: 'Familia García López',
    jefeObraId: 'user-1-jefeobra-1', // Carlos López
    costosPorCategoria: [
      { id: 'costo-1-5-1', categoria: 'Movimiento de tierras', costo: 7500, notas: 'Excavación y preparación' },
      { id: 'costo-1-5-2', categoria: 'Albañilería', costo: 22000, notas: 'Muros y tabiquería' },
    ],
    dataAIHint: 'single family home',
  },
  { // Nueva obra para Empresa 1
    id: 'obra-1-6',
    empresaId: 'empresa-1',
    nombre: 'Parking Subterráneo Centro Comercial',
    direccion: 'Avenida Comercial, S/N, Alcobendas',
    fechaInicio: new Date('2024-11-15'),
    fechaFin: null, // En curso
    clienteNombre: 'Gestora CC Norte',
    jefeObraId: 'user-1-jefeobra-3', // Roberto Sanz (Nuevo JO)
    costosPorCategoria: [],
    dataAIHint: 'underground parking construction',
  },

  // --- Obras para Reformas Integrales Alfa (empresa-2) ---
  {
    id: 'obra-2-1',
    empresaId: 'empresa-2',
    nombre: 'Adecuación Local Comercial para Franquicia',
    direccion: 'Avenida Diagonal, 200, Barcelona',
    fechaInicio: new Date('2024-06-01'),
    fechaFin: new Date('2024-08-15'), 
    clienteNombre: 'Franquicias XYZ',
    jefeObraId: 'user-2-jefeobra-1', 
    costosPorCategoria: [
        { id: 'costo-2-1-1', categoria: 'Pladur', costo: 1800, notas: 'Divisiones interiores y falso techo' },
        { id: 'costo-2-1-2', categoria: 'Pintura', costo: 900, notas: 'Completo, incluye esmaltes' },
        { id: 'costo-2-1-3', categoria: 'Iluminación LED', costo: 1200 },
    ],
    dataAIHint: 'retail store setup',
  },
  { 
    id: 'obra-2-2',
    empresaId: 'empresa-2',
    nombre: 'Reforma Cocina y Baños - Vivienda Particular',
    direccion: 'Calle Balmes, 55, Barcelona',
    fechaInicio: new Date('2024-08-20'),
    fechaFin: null, 
    clienteNombre: 'Familia Martí',
    jefeObraId: 'user-2-jefeobra-1', 
    costosPorCategoria: [
      { id: 'costo-2-2-1', categoria: 'Demoliciones', costo: 600, notas: 'Retirada de antiguos elementos' },
    ],
    dataAIHint: 'kitchen bathroom remodel',
  },
  { // Nueva obra para Empresa 2
    id: 'obra-2-3',
    empresaId: 'empresa-2',
    nombre: 'Impermeabilización Cubierta Comunidad',
    direccion: 'Calle Provenza, 150, Barcelona',
    fechaInicio: new Date('2024-09-10'),
    fechaFin: new Date('2024-11-30'),
    clienteNombre: 'Comunidad Propietarios Provenza 150',
    jefeObraId: 'user-2-jefeobra-2', // Mónica Vidal (Nueva JO)
    costosPorCategoria: [
      { id: 'costo-2-3-1', categoria: 'Limpieza y preparación', costo: 450 },
      { id: 'costo-2-3-2', categoria: 'Tela asfáltica', costo: 1700, notas: 'Material e instalación' },
    ],
    dataAIHint: 'roof waterproofing',
  },

  // --- Obras para Edifica Futuro Group (empresa-3) ---
  {
    id: 'obra-3-1',
    empresaId: 'empresa-3',
    nombre: 'Edificio Residencial "Mirador del Parque"',
    direccion: 'Calle de la Innovación, 10, Valencia',
    fechaInicio: new Date('2023-11-01'),
    fechaFin: new Date('2025-06-30'),
    clienteNombre: 'Promociones Urbanas Futuro',
    jefeObraId: 'user-3-jefeobra-1', 
    costosPorCategoria: [
      { id: 'costo-3-1-1', categoria: 'Movimiento de Tierras', costo: 35000, notas: 'Fase inicial' },
    ],
    dataAIHint: 'residential building construction',
  },
  {
    id: 'obra-3-2',
    empresaId: 'empresa-3',
    nombre: 'Pintura y Acabados Chalet Lujo "VistaMar"',
    direccion: 'Urbanización Los Pinos, 45, Marbella',
    fechaInicio: new Date('2024-08-01'),
    fechaFin: new Date('2024-10-30'), 
    clienteNombre: 'Familia Rodriguez',
    jefeObraId: 'user-3-jefeobra-2', 
    costosPorCategoria: [
       { id: 'costo-3-2-1', categoria: 'Pintura Exterior', costo: 4500, notas: 'Fachada y muros perimetrales' },
       { id: 'costo-3-2-2', categoria: 'Pintura Interior', costo: 3200, notas: 'Decorativa, estucos' },
    ],
    dataAIHint: 'luxury villa painting',
  },
  { 
    id: 'obra-3-3',
    empresaId: 'empresa-3',
    nombre: 'Instalación Paneles Solares Comunidad Vecinos',
    direccion: 'Calle Energía Solar, 1-15, Sevilla',
    fechaInicio: new Date('2024-10-01'),
    fechaFin: null, 
    clienteNombre: 'Comunidad Sol Radiante',
    jefeObraId: 'user-3-jefeobra-1', 
    costosPorCategoria: [],
    dataAIHint: 'solar panel installation',
  },
  { // Nueva obra para Empresa 3
    id: 'obra-3-4',
    empresaId: 'empresa-3',
    nombre: 'Centro Deportivo Municipal - Fase 1',
    direccion: 'Avenida del Deporte, 1, Málaga',
    fechaInicio: new Date('2024-12-01'),
    fechaFin: null, // En curso
    clienteNombre: 'Ayuntamiento de Málaga',
    jefeObraId: 'user-3-jefeobra-3', // Javier Martín (Nuevo JO)
    costosPorCategoria: [
      { id: 'costo-3-4-1', categoria: 'Estructura Vestuarios', costo: 18500 },
    ],
    dataAIHint: 'sports center construction',
  }
];
