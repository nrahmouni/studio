import type { Parte } from '@/lib/types';

export const mockPartes: Parte[] = [
  {
    id: 'parte-1-1-1',
    usuarioId: 'user-1-trabajador-1', // Lucía Fernández
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    fecha: new Date('2024-07-20'),
    tareasRealizadas: 'Instalación de sanitarios en baño principal. Colocación de grifería. Pruebas de fontanería.',
    tareasSeleccionadas: ['fontaneria', 'sanitarios'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Baño+Instalado'],
    incidencias: 'Pequeña fuga detectada en lavabo, corregida.',
    validado: true,
    validadoPor: 'user-1-jefeobra',
    timestamp: new Date('2024-07-20T17:30:00Z'),
    dataAIHint: "bathroom plumbing"
  },
  {
    id: 'parte-1-2-1',
    usuarioId: 'user-1-trabajador-2', // Marcos García
    obraId: 'obra-1-2', // Construcción Nave Industrial
    fecha: new Date('2024-07-21'),
    tareasRealizadas: 'Montaje de estructura metálica sector B. Soldadura de uniones. Comprobación de niveles.',
    tareasSeleccionadas: ['estructura', 'soldadura'],
    fotosURLs: [],
    incidencias: 'Retraso en la entrega de material (vigas tipo H). Se notificó a jefe de obra.',
    validado: false,
    timestamp: new Date('2024-07-21T18:00:00Z'),
    dataAIHint: "metal structure assembly"
  },
  {
    id: 'parte-1-1-2',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-1',
    fecha: new Date('2024-07-22'),
    tareasRealizadas: 'Alicatado de paredes en cocina. Preparación de superficie y rejuntado.',
    incidencias: '',
    tareasSeleccionadas: ['alicatado', 'cocina'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Cocina+Alicatada', 'https://placehold.co/300x200.png?text=Detalle+Rejuntado'],
    validado: false,
    timestamp: new Date('2024-07-22T16:45:00Z'),
    dataAIHint: "kitchen tiling"
  },
  {
    id: 'parte-2-1-1',
    usuarioId: 'user-2-trabajador-1', // David Sanz
    obraId: 'obra-2-1', // Adecuación Local Comercial
    fecha: new Date('2024-07-22'),
    tareasRealizadas: 'Instalación de Pladur en divisiones interiores. Colocación de perfilería y placas.',
    tareasSeleccionadas: ['pladur', 'divisiones'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Pladur+Instalado'],
    incidencias: 'Faltan 5 placas de Pladur RF, se ha solicitado más material.',
    validado: true,
    validadoPor: 'user-2-admin',
    timestamp: new Date('2024-07-22T19:00:00Z'),
    dataAIHint: "drywall installation"
  },
   {
    id: 'parte-1-3-1',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-3', // Rehabilitación Fachada
    fecha: new Date('2024-07-23'),
    tareasRealizadas: 'Montaje de andamio sector sur. Aseguramiento y señalización de zona de trabajo.',
    tareasSeleccionadas: ['andamios', 'seguridad'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Andamio+Montado'],
    incidencias: '',
    validado: false,
    timestamp: new Date('2024-07-23T15:00:00Z'),
    dataAIHint: "scaffolding setup"
  },
];
