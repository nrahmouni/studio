
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page now simply redirects to the dashboard.
export default function AppRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null; // Or a loading spinner
}
