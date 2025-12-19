"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect the user to the login page as the starting point
    router.push('/login');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-semibold animate-pulse">Loading Payroll System...</p>
    </div>
  );
}