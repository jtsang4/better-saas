'use client';

import { useEffect } from 'react';
import { useInitialize } from '@/store/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useInitialize();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
