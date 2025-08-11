
import fs from 'fs';
import path from 'path';
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria, FichajeTrabajador } from '@/lib/types';

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
    // This function is now a no-op in the production environment to avoid file system errors.
    // The data is mutated in memory. In a real application, this would write to a database.
    if (process.env.NODE_ENV === 'development') {
        const filePath = path.join(dataDirectory, `${filename}.json`);
        try {
            await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error(`Error writing to ${filename}.json:`, error);
            throw new Error(`Could not save data to ${filename}.json`);
        }
    } else {
        // In a deployed/demo environment, we don't want to write files.
        // The data is already being updated in the in-memory array.
        return Promise.resolve();
    }
}


export let mockConstructoras: Constructora[] = readData<Constructora>('constructoras.json');
export let mockSubcontratas: Subcontrata[] = readData<Subcontrata>('subcontratas.json');
export let mockProyectos: any[] = readData<any>('proyectos.json');
export let mockTrabajadores: Trabajador[] = readData<Trabajador>('trabajadores.json');
export let mockMaquinaria: Maquinaria[] = readData<Maquinaria>('maquinaria.json');
export let mockReportesDiarios: any[] = readData<any>('reportesDiarios.json');
export let mockFichajes: FichajeTrabajador[] = readData<FichajeTrabajador>('fichajes.json');
