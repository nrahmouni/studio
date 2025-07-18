
'use client';
import { usePathname } from 'next-intl/client';
import { useEffect, useState } from "react";

// This component wraps parts of the app that need client-side hooks
// to avoid forcing parent layouts into client components.
export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(0);

  // This is a workaround to force re-render of sidebar when locale changes
  // because the layout is shared across locales.
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [pathname]);

  // We pass a key to the top-level div to ensure re-renders when needed.
  // The actual provider context would go here if we had one.
  return <div key={key}>{children}</div>;
}
