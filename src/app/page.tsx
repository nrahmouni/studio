
'use client';
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-6 p-8 rounded-lg shadow-xl bg-card border">
        <h1 className="text-3xl font-bold text-primary font-headline">Test Navigation</h1>
        <p className="text-muted-foreground">Please choose an option to continue.</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/dashboard" passHref>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Demo Dashboard
            </Button>
          </Link>
          <Link href="/auth/register/empresa" passHref>
            <Button size="lg" className="w-full sm:w-auto">
              <Briefcase className="mr-2 h-5 w-5" />
              Register Company
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
