import { TrabajadorLoginForm } from "@/components/auth/TrabajadorLoginForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TrabajadorLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="absolute top-4 left-4">
        <Link href="/auth/select-role" passHref>
          <Button variant="ghost" className="text-primary hover:bg-primary/10">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </Link>
      </div>
       <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-primary/80 transition-colors">
          ObraLink
        </Link>
         <p className="text-muted-foreground mt-1">Acceso para Trabajadores</p>
      </div>
      <TrabajadorLoginForm />
       <p className="mt-8 text-center text-sm text-muted-foreground">
        Si no tienes acceso, contacta con el administrador de tu empresa.
      </p>
    </div>
  );
}
