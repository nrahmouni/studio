
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, User, Building, HardHat, Wrench, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Role = 'encargado' | 'subcontrata_admin' | 'constructora_admin' | 'trabajador';
const availableRoles = [
    { name: 'constructora_admin', label: 'Constructora (Admin)', icon: Building },
    { name: 'subcontrata_admin', label: 'Subcontrata (Admin)', icon: Wrench },
    { name: 'encargado', label: 'Encargado de Obra', icon: HardHat },
    { name: 'trabajador', label: 'Trabajador', icon: User },
];

const roleRedirects = {
    encargado: '/encargado/reporte-diario',
    subcontrata_admin: '/subcontrata/proyectos',
    constructora_admin: '/constructora/dashboard',
    trabajador: '/trabajador/fichar',
};

function RoleSwitcher() {
  const setRole = (role) => {
    localStorage.setItem('userRole_obra_link', role);
    localStorage.setItem('userId_obra_link', 'user-mock-id');
    localStorage.setItem('constructoraId_obra_link', 'const-sorigui-mock');
    localStorage.setItem('subcontrataId_obra_link', 'sub-caram-mock');
    localStorage.setItem('trabajadorId_obra_link', 'trab-01-mock');
    localStorage.setItem('encargadoId_obra_link', 'user-encargado-mock');
    window.location.reload();
  };
  return (
    
      
        
           Simulador de Roles (Desarrollo)
          
           Selecciona un rol para ver su panel de control. La aplicación está usando datos de demostración sin autenticación real.
          
        
        
          {availableRoles.map(roleInfo => (
            
               
                 Acceder como:
                
                {roleInfo.label}
            
          
        ))}
      
    
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole_obra_link');
    
    if (userRole && roleRedirects[userRole]) {
      router.replace(roleRedirects[userRole]);
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      
        
      
    );
  }

  return (
      
        
          
            
                
                    Modo de Datos Simulado
                   La aplicación está funcionando con datos de demostración. Los cambios que realices se guardarán temporalmente en archivos JSON.
                
            
            
               Selecciona un rol a continuación para empezar a probar la aplicación.
            
          
          
        
      
  );
}
