
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria, FichajeTrabajador } from '@/lib/types';
import constructoras from './data/constructoras.json';
import subcontratas from './data/subcontratas.json';
import proyectos from './data/proyectos.json';
import trabajadores from './data/trabajadores.json';
import maquinaria from './data/maquinaria.json';
import reportesDiarios from './data/reportesDiarios.json';
import fichajes from './data/fichajes.json';


// In-memory data stores initialized by directly importing the JSON files.
// This is more reliable than using fs.readFileSync in some server environments.
export let mockConstructoras: Constructora[] = constructoras;
export let mockSubcontratas: Subcontrata[] = subcontratas;
export let mockProyectos: any[] = proyectos;
export let mockTrabajadores: Trabajador[] = trabajadores;
export let mockMaquinaria: Maquinaria[] = maquinaria;
export let mockReportesDiarios: any[] = reportesDiarios;
export let mockFichajes: FichajeTrabajador[] = fichajes;

console.log('[MockData] Data loaded directly from JSON imports.');
console.log(`[MockData] Constructoras loaded: ${mockConstructoras.length}`);
console.log(`[MockData] Subcontratas loaded: ${mockSubcontratas.length}`);
console.log(`[MockData] Proyectos loaded: ${mockProyectos.length}`);
console.log(`[MockData] Trabajadores loaded: ${mockTrabajadores.length}`);
console.log(`[MockData] Maquinaria loaded: ${mockMaquinaria.length}`);
console.log(`[MockData] ReportesDiarios loaded: ${mockReportesDiarios.length}`);


// This function is now a no-op. Changes are only kept in memory for the demo session.
export async function saveDataToFile(filename: string, data: any) {
    console.log(`[MockData] NOTE: saveDataToFile is a no-op. Changes for '${filename}' are in-memory only.`);
    return Promise.resolve();
}
