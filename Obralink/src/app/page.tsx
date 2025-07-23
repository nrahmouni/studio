'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/landingdemo');
  }, [router]);

  return null; 
}
