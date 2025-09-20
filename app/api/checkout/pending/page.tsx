'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

const CheckoutPendingPage = () => {
  return (
    <div className="bg-brand-gray-100 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl text-center">
          <Clock className="w-20 h-20 mx-auto text-yellow-500 mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-gray-900">Pagamento Pendente</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Seu pedido foi recebido e estamos aguardando a confirmação do pagamento.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Isso pode levar alguns instantes. Você será notificado por e-mail assim que o pagamento for aprovado.
          </p>
          <div className="mt-8">
            <Link href="/" className="bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
              Voltar para a Página Inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPendingPage;
