import type { Empresa } from '@/lib/types';

export const mockEmpresas: Empresa[] = [
  {
    id: 'empresa-1',
    nombre: 'Construcciones Modernas S.L.',
    CIF: 'B12345678',
    emailContacto: 'contacto@construccionesmodernas.es',
    telefono: '912345678',
    logoURL: '/obralink-logo.png', // Updated logo URL
    dataAIHint: 'construction building'
  },
  {
    id: 'empresa-2',
    nombre: 'Reformas Integrales Alfa',
    CIF: 'C87654321',
    emailContacto: 'info@reformas-alfa.com',
    telefono: '938765432',
    logoURL: 'https://placehold.co/100x100.png', // Keeping placeholder for other companies
    dataAIHint: 'renovation tools'
  },
  {
    id: 'empresa-3',
    nombre: 'Edifica Futuro Group',
    CIF: 'A11223344',
    emailContacto: 'admin@edificafuturo.es',
    telefono: '951122334',
    logoURL: 'https://placehold.co/100x100.png', // Keeping placeholder for other companies
    dataAIHint: 'architecture blueprint'
  },
];
