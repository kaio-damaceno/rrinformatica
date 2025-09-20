'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { SiteDataProvider } from '@/contexts/SiteDataContext';
import { CartProvider } from '@/contexts/CartContext';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteDataProvider>
        {/* FIX: Nest children inside the innermost provider to resolve a chain of type errors. */}
        <CartProvider>{children}</CartProvider>
      </SiteDataProvider>
    </AuthProvider>
  );
}