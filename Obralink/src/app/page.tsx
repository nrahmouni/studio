
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page now simply redirects to the new main landing page.
export default function AppRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/landingdemo');
  }, [router]);

  return null; // Or a loading spinner
}
