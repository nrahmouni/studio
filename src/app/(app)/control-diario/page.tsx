// This page is obsolete in the new role architecture.
// It is being replaced by the Encargado's dashboard/reporting view.
// Redirecting to the dashboard to avoid errors.
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedControlDiarioPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
