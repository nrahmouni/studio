
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
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
             <div className="animate-fade-in-down">
                <h1 className="text-3xl font-bold font-headline text-primary">Mi Fichaje</h1>
                <p className="text-muted-foreground mt-1">Registra tu entrada y salida de la jornada.</p>
             </div>
            
            <div className="flex items-center justify-center pt-8">
                <Card className="w-full max-w-sm text-center animate-fade-in-up shadow-lg">
                    <CardHeader>
                        <CardTitle>Registro de Jornada</CardTitle>
                        <CardDescription>Pulsa el botón correspondiente para registrar tu hora de inicio o fin.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 p-6">
                        <Button 
                            className="h-28 text-2xl bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform" 
                            onClick={() => handleFichaje('inicio')}
                            disabled={isSubmitting || status === 'in'}
                        >
                            {isSubmitting && status === 'out' ? <Loader2 className="animate-spin mr-2 h-8 w-8"/> : <LogIn className="mr-3 h-8 w-8"/>}
                            Registrar INICIO
                        </Button>
                        <Button 
                            className="h-28 text-2xl bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform"
                            onClick={() => handleFichaje('fin')}
                            disabled={isSubmitting || status === 'out'}
                        >
                            {isSubmitting && status === 'in' ? <Loader2 className="animate-spin mr-2 h-8 w-8"/> : <LogOut className="mr-3 h-8 w-8"/>}
                            Registrar FIN
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
