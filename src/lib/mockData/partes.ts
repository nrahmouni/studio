
import type { Parte } from '@/lib/types';

const today = new Date();
const yesterday = new Date(new Date().setDate(today.getDate() - 1));
const threeDaysAgo = new Date(new Date().setDate(today.getDate() - 3));
const lastWeek = new Date(new Date().setDate(today.getDate() - 7));

export const mockPartes: Parte[] = [
  // Partes existentes
  {
    id: 'parte-1-1-1',
    usuarioId: 'user-1-trabajador-1', // Lucía Fernández
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    fecha: new Date('2024-07-20'),
    tareasRealizadas: 'Instalación de sanitarios en baño principal. Colocación de grifería. Pruebas de fontanería.',
    horasTrabajadas: 8,
    tareasSeleccionadas: ['fontaneria', 'sanitarios'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Baño+Instalado'],
    incidencias: 'Pequeña fuga detectada en lavabo, corregida.',
    validado: true,
    validadoPor: 'user-1-jefeobra-1', // Carlos López
    timestamp: new Date('2024-07-20T17:30:00Z'),
    dataAIHint: "bathroom plumbing"
  },
  {
    id: 'parte-1-2-1',
    usuarioId: 'user-1-trabajador-2', // Marcos García
    obraId: 'obra-1-2', // Construcción Nave Industrial
    fecha: new Date('2024-07-21'),
    tareasRealizadas: 'Montaje de estructura metálica sector B. Soldadura de uniones. Comprobación de niveles.',
    horasTrabajadas: 7.5,
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
    horasTrabajadas: 8,
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
    horasTrabajadas: 6,
    tareasSeleccionadas: ['pladur', 'divisiones'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Pladur+Instalado'],
    incidencias: 'Faltan 5 placas de Pladur RF, se ha solicitado más material.',
    validado: true,
    validadoPor: 'user-2-admin', // Sofía Ramírez
    timestamp: new Date('2024-07-22T19:00:00Z'),
    dataAIHint: "drywall installation"
  },
   {
    id: 'parte-1-3-1',
    usuarioId: 'user-1-trabajador-1',
    obraId: 'obra-1-3', // Rehabilitación Fachada
    fecha: new Date('2024-07-23'),
    tareasRealizadas: 'Montaje de andamio sector sur. Aseguramiento y señalización de zona de trabajo.',
    horasTrabajadas: 4,
    tareasSeleccionadas: ['andamios', 'seguridad'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Andamio+Montado'],
    incidencias: '',
    validado: false,
    timestamp: new Date('2024-07-23T15:00:00Z'),
    dataAIHint: "scaffolding setup"
  },
  // --- Nuevos Partes de Trabajo ---
  {
    id: 'parte-1-5-1', // Nueva obra 1-5, nuevo trabajador 1-6
    usuarioId: 'user-1-trabajador-6', // Andrea Gil
    obraId: 'obra-1-5', // Vivienda Unifamiliar "El Mirador"
    fecha: lastWeek,
    tareasRealizadas: 'Replanteo de muros de sótano. Comprobación de cotas.',
    horasTrabajadas: 8,
    tareasSeleccionadas: ['replanteo', 'cimentacion'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Replanteo+Sotano'],
    incidencias: 'Terreno más rocoso de lo esperado en zona oeste.',
    validado: true,
    validadoPor: 'user-1-jefeobra-1', // Carlos López
    timestamp: new Date(new Date(lastWeek).setHours(17,0,0,0)),
    dataAIHint: "basement layout"
  },
  {
    id: 'parte-1-6-1', // Nueva obra 1-6, nuevo trabajador 1-7
    usuarioId: 'user-1-trabajador-7', // Sergio Peña
    obraId: 'obra-1-6', // Parking Subterráneo
    fecha: threeDaysAgo,
    tareasRealizadas: 'Excavación con retroexcavadora nivel -1. Retirada de tierras.',
    horasTrabajadas: 7,
    tareasSeleccionadas: ['excavacion', 'maquinaria'],
    fotosURLs: [],
    incidencias: '',
    validado: false,
    timestamp: new Date(new Date(threeDaysAgo).setHours(16,30,0,0)),
    dataAIHint: "excavation work"
  },
  {
    id: 'parte-2-3-1', // Nueva obra 2-3, nuevo trabajador 2-3
    usuarioId: 'user-2-trabajador-3', // Carlos Ruiz
    obraId: 'obra-2-3', // Impermeabilización Cubierta
    fecha: yesterday,
    tareasRealizadas: 'Limpieza de cubierta y preparación de superficie para imprimación. Retirada de elementos sueltos.',
    horasTrabajadas: 8,
    tareasSeleccionadas: ['impermeabilizacion', 'limpieza'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Cubierta+Limpia'],
    incidencias: 'Canalón obstruido, se ha limpiado.',
    validado: true,
    validadoPor: 'user-2-jefeobra-2', // Mónica Vidal
    timestamp: new Date(new Date(yesterday).setHours(18,15,0,0)),
    dataAIHint: "roof cleaning"
  },
  {
    id: 'parte-3-4-1', // Nueva obra 3-4, nuevo trabajador 3-3
    usuarioId: 'user-3-trabajador-3', // Isabel Roca
    obraId: 'obra-3-4', // Centro Deportivo Municipal
    fecha: today,
    tareasRealizadas: 'Colocación de encofrado para pilares de vestuarios. Aplomado y nivelación.',
    horasTrabajadas: 5, // Media jornada
    tareasSeleccionadas: ['encofrado', 'estructura'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Encofrado+Pilares'],
    incidencias: '',
    validado: false,
    timestamp: new Date(new Date(today).setHours(14,0,0,0)),
    dataAIHint: "formwork pillars"
  },
  {
    id: 'parte-1-1-3', // Obra existente, trabajador existente
    usuarioId: 'user-1-trabajador-3', // Javier Soler
    obraId: 'obra-1-1', // Reforma Integral Ático Sol
    fecha: lastWeek,
    tareasRealizadas: 'Instalación de falso techo de pladur en salón. Encintado de juntas.',
    horasTrabajadas: 8,
    tareasSeleccionadas: ['pladur', 'techos'],
    fotosURLs: [],
    incidencias: 'Una placa de pladur dañada, se reemplazó.',
    validado: true,
    validadoPor: 'user-1-jefeobra-1', // Carlos López
    timestamp: new Date(new Date(lastWeek).setHours(17,45,0,0)),
    dataAIHint: "false ceiling"
  },
  {
    id: 'parte-1-2-2', // Obra existente, trabajador existente
    usuarioId: 'user-1-trabajador-2', // Marcos García
    obraId: 'obra-1-2', // Construcción Nave Industrial
    fecha: today,
    tareasRealizadas: 'Colocación de paneles sándwich en cubierta sector A.',
    horasTrabajadas: 6,
    tareasSeleccionadas: ['cubiertas', 'paneles'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Paneles+Cubierta'],
    incidencias: 'Viento fuerte dificultó la tarea por la mañana.',
    validado: false,
    timestamp: new Date(new Date(today).setHours(16,0,0,0)),
    dataAIHint: "sandwich panel roof"
  },
  {
    id: 'parte-2-2-1', // Obra existente, trabajador existente
    usuarioId: 'user-2-trabajador-2', // Ana Torres
    obraId: 'obra-2-2', // Reforma Cocina y Baños
    fecha: yesterday,
    tareasRealizadas: 'Demolición de azulejos antiguos en baño. Desescombro.',
    horasTrabajadas: 7,
    tareasSeleccionadas: ['demolicion', 'baños'],
    fotosURLs: [],
    incidencias: '',
    validado: true,
    validadoPor: 'user-2-jefeobra-1', // Ricardo Montes
    timestamp: new Date(new Date(yesterday).setHours(17,30,0,0)),
    dataAIHint: "tile demolition"
  },
  {
    id: 'parte-3-1-1', // Obra existente, trabajador existente
    usuarioId: 'user-3-trabajador-1', // Laura Jimenez
    obraId: 'obra-3-1', // Edificio Residencial "Mirador del Parque"
    fecha: threeDaysAgo,
    tareasRealizadas: 'Hormigonado de losa planta primera. Vibrado y regleado.',
    horasTrabajadas: 8,
    tareasSeleccionadas: ['hormigonado', 'estructura'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Losa+Hormigonada'],
    incidencias: 'Bomba de hormigón llegó con 30 min de retraso.',
    validado: true,
    validadoPor: 'user-3-jefeobra-1', // Miguel Torres
    timestamp: new Date(new Date(threeDaysAgo).setHours(18,0,0,0)),
    dataAIHint: "concrete slab pouring"
  },
  {
    id: 'parte-3-2-1', // Obra existente, trabajador nuevo 3-4
    usuarioId: 'user-3-trabajador-4', // Mario Luna
    obraId: 'obra-3-2', // Pintura y Acabados Chalet
    fecha: lastWeek,
    tareasRealizadas: 'Lijado y preparación de paredes interiores para pintura. Aplicación de imprimación.',
    horasTrabajadas: 7.5,
    tareasSeleccionadas: ['pintura', 'preparacion'],
    fotosURLs: [],
    incidencias: '',
    validado: true,
    validadoPor: 'user-3-jefeobra-2', // Laura Campos
    timestamp: new Date(new Date(lastWeek).setHours(17,15,0,0)),
    dataAIHint: "wall sanding preparation"
  },
  {
    id: 'parte-1-4-1', // Obra existente, trabajador nuevo 1-6
    usuarioId: 'user-1-trabajador-6', // Andrea Gil
    obraId: 'obra-1-4', // Ampliación Oficinas TechCorp
    fecha: today,
    tareasRealizadas: 'Instalación de suelo técnico en sala de reuniones. Nivelación de pedestales.',
    horasTrabajadas: 8,
    tareasSeleccionadas: ['suelos', 'oficinas'],
    fotosURLs: ['https://placehold.co/300x200.png?text=Suelo+Tecnico'],
    incidencias: '',
    validado: false,
    timestamp: new Date(new Date(today).setHours(17,0,0,0)),
    dataAIHint: "raised floor installation"
  }
];
