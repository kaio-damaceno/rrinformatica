'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  bestseller?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, bestseller }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400x300';
  const rating = product.rating;
  const productUrl = `/product/${product.id}`;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product);
    // Maybe show a toast notification here in the future
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
      <Link href={productUrl} className="block">
        <div className="relative w-full h-56 bg-gray-200 overflow-hidden">
          {bestseller && (
            <div className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
              MAIS VENDIDO
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
              ESGOTADO
            </div>
          )}
          <Image 
            src={imageUrl} 
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-110 transition-transform duration-500 ease-in-out"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        {product.brand && <span className="text-xs font-semibold text-gray-500 mb-1">{product.brand}</span>}
        <Link href={productUrl}>
          <h3 className="text-base font-bold mb-2 text-brand-gray-900 flex-grow hover:text-brand-blue transition-colors">{product.name}</h3>
        </Link>

        {rating && (
          <div className="flex items-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(rating.rate) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({rating.count})</span>
          </div>
        )}

        <div className="mt-auto pt-4">
          <p className="text-2xl font-bold text-brand-blue mb-4">
            {formattedPrice}
          </p>
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
            aria-disabled={isOutOfStock}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{isOutOfStock ? 'Indisponível' : 'Adicionar ao Carrinho'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;