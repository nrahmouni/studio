
'use client';
import { redirect } from '@/navigation';
import { useEffect } from 'react';

// This is the root page of the app.
// It redirects to the default locale's landing page.
export default function RootPage() {
  useEffect(() => {
    redirect('/');
  }, []);

  return null;
}

