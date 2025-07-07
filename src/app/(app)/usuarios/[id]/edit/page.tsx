// This page is obsolete in the new role architecture.
// It will be replaced by role-specific user editing views.
// Redirecting to the dashboard to avoid errors.
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedUsuariosEditPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
