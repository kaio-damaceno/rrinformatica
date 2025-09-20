'use client';

import React, { useState, useMemo, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedProductsSectionProps {
  products: Product[];
  loading: boolean;
}

const TABS = ["Promoções", "Destaques", "Produtos Novos", "Oferta do Dia", "Mais Vendidos", "Baratinhos"];

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ products, loading }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', skipSnaps: false, dragFree: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Since we don't have real data for tabs, we'll just shuffle and slice products for each tab.
  const displayedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    // This is a placeholder logic. In a real app, you'd fetch data for each tab.
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10); // Show up to 10 products per category.
  }, [products, activeTab]);
  
  if (loading) {
    return (
        <section className="py-16 bg-brand-gray-100">
            <div className="container mx-auto px-6">
                <div className="h-8 bg-gray-300 rounded-lg w-1/3 mx-auto mb-8 animate-pulse"></div>
                <div className="flex justify-center gap-4 mb-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded-full w-28 animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-lg h-96 animate-pulse">
                            <div className="h-56 bg-gray-200 rounded-t-xl"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-6 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                     ))}
                </div>
            </div>
        </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if there are no products
  }

  return (
    <section className="py-16 bg-brand-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-brand-gray-900 mb-4">
          {activeTab} da Semana
        </h2>
        <p className="text-center text-gray-600 mb-10">Confira nossa seleção especial de produtos para você!</p>
        
        {/* Tabs */}
        <div className="flex justify-center flex-wrap gap-3 mb-12">
            {TABS.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 text-sm md:text-base ${
                        activeTab === tab
                        ? 'bg-brand-red text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Products Carousel */}
        <div className="relative">
             <div className="embla -mx-2" ref={emblaRef}>
                <div className="embla__container px-2">
                    {displayedProducts.map(product => (
                        <div className="embla__slide px-2" key={product.id} style={{ flex: '0 0 280px' }}>
                             <ProductCard product={product} />
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

export default FeaturedProductsSection;