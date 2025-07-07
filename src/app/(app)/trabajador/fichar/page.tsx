'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { saveFichaje } from '@/lib/actions/app.actions';

export default function FichajePage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'in' | 'out'>('out');

    const handleFichaje = async (tipo: 'inicio' | 'fin') => {
        setIsSubmitting(true);
        // Use a mock ID for development since there's no real login
        const trabajadorId = localStorage.getItem('trabajadorId_obra_link') || 'trab-01-mock';

        if (!trabajadorId) {
            toast({ title: 'Error', description: 'No se pudo identificar al trabajador.', variant: 'destructive' });
            setIsSubmitting(false);
            return;
        }

        const result = await saveFichaje({ trabajadorId, tipo });
        
        if (result.success) {
            toast({ title: 'Éxito', description: result.message });
            setStatus(tipo === 'inicio' ? 'in' : 'out');
        } else {
            toast({ title: 'Error', description: 'No se pudo registrar el fichaje.', variant: 'destructive' });
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <h1 className="text-3xl font-bold font-headline text-primary mb-4">Mi Fichaje</h1>
            <div className="flex items-center justify-center">
                <Card className="w-full max-w-sm text-center animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Registro de Jornada</CardTitle>
                        <CardDescription>Pulsa el botón para registrar tu hora de inicio o fin.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 p-6">
                        <Button 
                            className="h-24 text-2xl bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => handleFichaje('inicio')}
                            disabled={isSubmitting || status === 'in'}
                        >
                            {isSubmitting && status === 'out' ? <Loader2 className="animate-spin mr-2 h-8 w-8"/> : <LogIn className="mr-3 h-8 w-8"/>}
                            Registrar INICIO
                        </Button>
                        <Button 
                            className="h-24 text-2xl bg-red-600 hover:bg-red-700 text-white" 
                            onClick={() => handleFichaje('fin')}
                            disabled={isSubmitting || status === 'out'}
                        >
                            {isSubmitting && status === 'in' ? <Loader2 className="animate-spin mr-2 h-8 w-8"/> : <LogOut className="mr-3 h-8 w-8"/>}
                            Registrar FIN
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
