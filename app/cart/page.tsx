'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, getItemCount } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        throw new Error('Falha ao iniciar o processo de pagamento.');
      }

      const { init_point } = await response.json();
      if (init_point) {
        // Clear cart before redirecting to payment
        clearCart();
        router.push(init_point);
      } else {
        throw new Error('URL de pagamento não recebida.');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Não foi possível iniciar o checkout. Tente novamente.');
      setIsProcessing(false);
    }
  };
  
  const formattedPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  return (
    <div className="bg-brand-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-gray-900 mb-8">Seu Carrinho de Compras</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-xl shadow-md">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-brand-gray-800">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mt-2 mb-6">Adicione produtos para vê-los aqui.</p>
            <Link href="/catalog" className="bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Ir para o Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b last:border-b-0">
                  <Image src={item.images?.[0]?.url || ''} alt={item.name} width={100} height={100} className="w-24 h-24 object-contain rounded-lg bg-gray-100" />
                  <div className="flex-grow text-center sm:text-left">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-semibold text-brand-gray-800 hover:text-brand-blue">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500">{formattedPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <p className="font-bold text-lg w-28 text-center">{formattedPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-md sticky top-24">
                <h2 className="text-xl font-bold border-b pb-4 mb-4">Resumo do Pedido</h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getItemCount()} itens)</span>
                    <span>{formattedPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frete</span>
                    <span className="font-semibold text-green-600">Grátis</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-xl border-t pt-4">
                  <span>Total</span>
                  <span>{formattedPrice(getCartTotal())}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-brand-red text-white font-bold py-3 rounded-lg hover:bg-brand-red-dark transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
