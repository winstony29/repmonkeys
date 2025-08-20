'use client';

import { AppProvider } from '@/components/AppProvider';
import LandingPage from '@/components/demo/LandingPage';

export default function Home() {
  return (
    <AppProvider>
      <main className="min-h-screen w-full">
        <LandingPage />
      </main>
    </AppProvider>
  );
}
