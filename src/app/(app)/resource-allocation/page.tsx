// This page is obsolete in the new role architecture.
// This AI functionality can be re-integrated into a new view later.
// Redirecting to the dashboard to avoid errors.
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedResourceAllocationPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
