
'use client';
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppProvider } from "@/components/layout/AppProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader companyName="ObraLink" />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
