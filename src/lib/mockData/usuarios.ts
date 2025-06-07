
import type { UsuarioFirebase } from '@/lib/types';

export const mockUsuarios: UsuarioFirebase[] = [
  // Usuarios para Construcciones Modernas S.L. (empresa-1)
  {
    id: 'user-1-admin',
    empresaId: 'empresa-1',
    nombre: 'Administrador Principal (Empresa Demo)',
    email: 'empresa@example.com',
    dni: 'A00000000', 
    password: 'empresa', 
    rol: 'admin',
    activo: true,
    obrasAsignadas: ['obra-1-1', 'obra-1-2', 'obra-1-3'], // Admins can be "assigned" for overview
    dniAnversoURL: null,
    dniReversoURL: null,
  },
  {
    id: 'user-1-jefeobra',
    empresaId: 'empresa-1',
    nombre: 'Carlos López (Jefe Obra CM)',
    email: 'jefeobra.cm@example.com',
    dni: 'B11111111', 
    password: 'password123',
    rol: 'jefeObra',
    activo: true,
    obrasAsignadas: ['obra-1-1', 'obra-1-3'], // Jefe de obra explicitly assigned to these
    dniAnversoURL: null,
    dniReversoURL: null,
  },
  {
    id: 'user-1-trabajador-1',
    empresaId: 'empresa-1',
    nombre: 'Lucía Fernández (Trabajador Demo)',
    email: 'trabajador@example.com',
    dni: '12345678A', 
    password: 'trabajador',
    rol: 'trabajador',
    activo: true,
    obrasAsignadas: ['obra-1-1', 'obra-1-3'], // Lucía assigned to Ático Sol and Fachada
    dniAnversoURL: 'https://placehold.co/300x200.png?text=DNI+Anverso',
    dniReversoURL: 'https://placehold.co/300x200.png?text=DNI+Reverso',
  },
  {
    id: 'user-1-trabajador-2',
    empresaId: 'empresa-1',
    nombre: 'Marcos García (Trabajador CM)',
    email: 'marcos.g@example.com',
    dni: '87654321B', 
    password: 'password123',
    rol: 'trabajador',
    activo: true,
    obrasAsignadas: ['obra-1-2'], // Marcos assigned to Nave Industrial
    dniAnversoURL: null,
    dniReversoURL: null,
  },

  // Usuarios para Reformas Integrales Alfa (empresa-2)
  {
    id: 'user-2-admin',
    empresaId: 'empresa-2',
    nombre: 'Sofía Ramírez (Admin Alfa)',
    email: 'admin.alfa@example.com',
    dni: 'C22222222', 
    password: 'password123',
    rol: 'admin',
    activo: true,
    obrasAsignadas: ['obra-2-1'],
    dniAnversoURL: null,
    dniReversoURL: null,
  },
  {
    id: 'user-2-trabajador-1',
    empresaId: 'empresa-2',
    nombre: 'David Sanz (Trabajador Alfa)',
    email: 'david.s@example.com',
    dni: '11223344C', 
    password: 'password123',
    rol: 'trabajador',
    activo: true,
    obrasAsignadas: ['obra-2-1'], // David assigned to Local Comercial
    dniAnversoURL: null,
    dniReversoURL: null,
  },

  // Usuarios para Edifica Futuro Group (empresa-3)
   {
    id: 'user-3-admin',
    empresaId: 'empresa-3',
    nombre: 'Elena Vazquez (Admin Edifica)',
    email: 'admin.edifica@example.com',
    dni: 'D33333333', 
    password: 'password123',
    rol: 'admin',
    activo: true,
    obrasAsignadas: ['obra-3-1', 'obra-3-2'],
    dniAnversoURL: null,
    dniReversoURL: null,
  },
  {
    id: 'user-3-jefeobra',
    empresaId: 'empresa-3',
    nombre: 'Miguel Torres (Jefe Obra Edifica)',
    email: 'jefeobra.edifica@example.com',
    dni: 'E44444444', 
    password: 'password123',
    rol: 'jefeObra',
    activo: true,
    obrasAsignadas: ['obra-3-1'], // Miguel assigned to Edificio Residencial
    dniAnversoURL: null,
    dniReversoURL: null,
  },
  {
    id: 'user-3-trabajador-1',
    empresaId: 'empresa-3',
    nombre: 'Laura Jimenez (Trabajador Edifica)',
    email: 'laura.j@example.com',
    dni: '55667788D', 
    password: 'password123',
    rol: 'trabajador',
    activo: true,
    obrasAsignadas: ['obra-3-1', 'obra-3-2'], // Laura assigned to both
    dniAnversoURL: null,
    dniReversoURL: null,
  },
];

