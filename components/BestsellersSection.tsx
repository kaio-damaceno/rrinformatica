'use client';

import React, { useMemo, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BestsellersSectionProps {
  products: Product[];
  loading: boolean;
}

const BestsellersSection: React.FC<BestsellersSectionProps> = ({ products, loading }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const bestsellers = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Sort by rating count as a proxy for sales, showing top 12
    return [...products]
      .sort((a, b) => (b.rating?.count || 0) - (a.rating?.count || 0))
      .slice(0, 12);
  }, [products]);

  if (loading) {
    return (
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-600 rounded-lg w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-xl shadow-lg h-96 animate-pulse">
                <div className="h-56 bg-gray-600 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <div className="h-8 bg-gray-600 rounded w-1/2 mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (bestsellers.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-brand-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-black uppercase tracking-wider">Os Mais Vendidos</h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Os preferidos dos nossos clientes, agora ao seu alcance.
          </p>
        </div>

        <div className="relative">
          <div className="embla -mx-2" ref={emblaRef}>
            <div className="embla__container px-2">
              {bestsellers.map((product) => (
                <div className="embla__slide px-2" key={product.id} style={{ flex: '0 0 280px' }}>
                  <ProductCard product={product} bestseller />
                </div>
              ))}
            </div>
          </div>
          <button onClick={scrollPrev} className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white transition-all z-10 hidden md:flex" aria-label="Anterior">
            <ChevronLeft className="h-6 w-6 text-brand-gray-800" />
          </button>
          <button onClick={scrollNext} className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white transition-all z-10 hidden md:flex" aria-label="Próximo">
            <ChevronRight className="h-6 w-6 text-brand-gray-800" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestsellersSection;