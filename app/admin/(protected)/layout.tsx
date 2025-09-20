'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Carregando...</p>
          <p className="text-sm text-gray-500">Verificando autenticação</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}