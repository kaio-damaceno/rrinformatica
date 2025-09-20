'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccessPage = () => {
  return (
    <div className="bg-brand-gray-100 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl text-center">
          <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-gray-900">Pagamento Aprovado!</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Obrigado pela sua compra! Seu pedido foi recebido e já estamos preparando tudo para o envio.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Você receberá um e-mail de confirmação com os detalhes do pedido em breve.
          </p>
          <div className="mt-8">
            <Link href="/catalog" className="bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
