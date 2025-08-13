
'use client';
// This component is now obsolete. Editing is handled by /encargado/asistencia/[id]/edit
// Redirecting to avoid errors.
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedEditReportePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/encargado/partes-enviados');
  }, [router]);
  return null;
}
