'use client';
// This page is obsolete, creating new attendance is now done via the ReporteDiarioPage
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedNewAsistenciaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/encargado/asistencia');
  }, [router]);
  return null;
}
