
'use client';
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { usePathname } from 'next-intl/client';
import { useEffect, useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  // This is a workaround to force re-render of sidebar when locale changes
  // because the layout is shared across locales.
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
       <AppHeader companyName="ObraLink" />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar key={key} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
