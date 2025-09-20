'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

const CheckoutFailurePage = () => {
  return (
    <div className="bg-brand-gray-100 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl text-center">
          <XCircle className="w-20 h-20 mx-auto text-red-500 mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-gray-900">Pagamento Recusado</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Houve um problema ao processar seu pagamento. Nenhuma cobrança foi efetuada.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Por favor, verifique os dados do seu cartão ou tente um método de pagamento diferente.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cart" className="bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md w-full sm:w-auto">
              Tentar Novamente
            </Link>
            <Link href="/" className="text-brand-gray-700 font-semibold w-full sm:w-auto">
              Voltar para a Loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailurePage;
