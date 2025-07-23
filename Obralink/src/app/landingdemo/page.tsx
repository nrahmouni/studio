// This file is obsolete and has been removed. The content was moved to src/app/page.tsx.
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ObsoleteLandingDemoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
