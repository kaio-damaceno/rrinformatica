'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { auth } from '@/lib/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!auth) {
      setError('Serviço de autenticação não está disponível.');
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao fazer login. Tente novamente.');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
         <p className="text-lg font-semibold text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 m-4">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-blue text-white p-3 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-brand-gray-800">Painel do Administrador</h1>
          <p className="text-gray-500 mt-2">Faça login para continuar</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}