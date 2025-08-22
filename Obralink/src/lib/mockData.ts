
import fs from 'fs';
import path from 'path';
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria, FichajeTrabajador } from '@/lib/types';
import { sub, add, formatISO } from 'date-fns';

const dataDirectory = path.join(process.cwd(), 'src', 'lib', 'data');

function readData<T>(filename: string): T[] {
    const filePath = path.join(dataDirectory, filename);
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

export async function saveDataToFile(filename: string, data: any) {
    const filePath = path.join(dataDirectory, `${filename}.json`);
    try {
        // En un entorno de desarrollo de solo lectura, esta operación puede fallar.
        // Se añade un try-catch aquí para que la app no se caiga si no tiene permisos de escritura.
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.warn(`Could not save data to ${filename}.json. Running in read-only mode. Error:`, error);
    }
}


export let mockConstructoras: Constructora[] = readData<Constructora>('constructoras.json');
export let mockSubcontratas: Subcontrata[] = readData<Subcontrata>('subcontratas.json');
export let mockProyectos: Proyecto[] = readData<Proyecto>('proyectos.json');
export let mockTrabajadores: Trabajador[] = readData<Trabajador>('trabajadores.json');
export let mockMaquinaria: Maquinaria[] = readData<Maquinaria>('maquinaria.json');
export let mockReportesDiarios: ReporteDiario[] = readData<ReporteDiario>('reportesDiarios.json');
export let mockFichajes: FichajeTrabajador[] = readData<FichajeTrabajador>('fichajes.json');
