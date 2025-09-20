'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductListItemProps {
  product: Product;
}

const ProductListItem: React.FC<ProductListItemProps> = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);
  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400x400';
  const rating = product.rating;
  const productUrl = `/product/${product.id}`;
  
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product);
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col sm:flex-row w-full">
      <Link href={productUrl} className="block sm:w-48 flex-shrink-0">
        <div className="relative h-48 sm:h-full w-full bg-gray-100 p-3 flex items-center justify-center">
          <Image 
            src={imageUrl} 
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
              ESGOTADO
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div className="flex-grow">
          <Link href={productUrl} className="block">
            {product.brand && <span className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{product.brand}</span>}
            <h3 className="text-base sm:text-lg font-bold text-brand-gray-900 line-clamp-2 leading-tight my-1 hover:text-brand-blue transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {rating && (
            <div className="flex items-center gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(rating.rate) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-xs text-gray-500 ml-1">({rating.count} avaliações)</span>
            </div>
          )}
          
          <p className="hidden md:block text-sm text-gray-600 mt-2 line-clamp-3">
            {product.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between mt-4 gap-4">
          <div className="flex-shrink-0">
              <p className="text-xs text-gray-500">A partir de</p>
              <p className="text-xl sm:text-2xl font-bold text-brand-blue">
                {formattedPrice}
              </p>
          </div>
          <button
            onClick={handleAddToCart}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-brand-blue text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
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

export default ProductListItem;