
import fs from 'fs';
import path from 'path';
import type { Constructora, Subcontrata, Proyecto, Trabajador, ReporteDiario, Maquinaria, FichajeTrabajador } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'src', 'lib', 'data');
console.log(`[MockData] Initializing... Base data directory resolved to: ${dataDirectory}`);


function readData<T>(filename: string): T[] {
    const filePath = path.join(dataDirectory, filename);
    console.log(`[MockData] Attempting to read data for: ${filename} from path: ${filePath}`);
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`[MockData] ERROR: File does not exist at path: ${filePath}`);
            throw new Error(`File not found: ${filename}`);
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');
        console.log(`[MockData] SUCCESS: Successfully read file: ${filename}`);
        const data = JSON.parse(fileContents);
        console.log(`[MockData] SUCCESS: Successfully parsed JSON for: ${filename}. Found ${data.length} records.`);
        return data;
    } catch (error: any) {
        console.error(`[MockData] CRITICAL ERROR reading or parsing ${filename}:`, error.message);
        console.error(`[MockData] Full error object for ${filename}:`, error);
        return [];
    }
}


export async function saveDataToFile(filename: string, data: any) {
    // This function is now a no-op in the production environment to avoid file system errors.
    // The data is mutated in memory. In a real application, this would write to a database.
    if (process.env.NODE_ENV === 'development') {
        const filePath = path.join(dataDirectory, `${filename}.json`);
        try {
            // NOTE: In some environments (like a restricted container), this may fail.
            // The primary goal is to have the in-memory update work for the demo session.
            // await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
             console.log(`[MockData] DEV MODE: Skipped writing to ${filename}.json to ensure stability.`);
        } catch (error) {
            console.error(`Error writing to ${filename}.json:`, error);
            // We don't re-throw, as the in-memory change is sufficient for the demo.
        }
    } else {
        // In a deployed/demo environment, we don't want to write files.
        // The data is already being updated in the in-memory array.
        console.log(`[MockData] NOTE: saveDataToFile is a no-op in this environment. Changes for '${filename}' are in-memory only.`);
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
