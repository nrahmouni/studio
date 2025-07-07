// This file is now obsolete. The application is running on mocked data without real authentication.
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect to the main dashboard where the role switcher is now located.
export default function ObsoleteSelectRolePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
