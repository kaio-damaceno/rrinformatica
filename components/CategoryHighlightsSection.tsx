'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CategoryHighlightsSectionProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
}

const CategoryHighlightsSection: React.FC<CategoryHighlightsSectionProps> = ({ products, categories, loading }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const parentCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter(c => !c.parentId);
  }, [categories]);

  useEffect(() => {
    if (parentCategories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(parentCategories[0].id);
    }
  }, [parentCategories, activeCategoryId]);

  const displayedProducts = useMemo(() => {
    if (!activeCategoryId || !products || !categories) return [];
    
    const childCategoryIds = categories.filter(c => c.parentId === activeCategoryId).map(c => c.id);
    const allCategoryIds = [activeCategoryId, ...childCategoryIds];
    
    return products
      .filter(p => p.categoryId && allCategoryIds.includes(p.categoryId))
      .sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)) // sort by highest rating
      .slice(0, 4);
  }, [activeCategoryId, products, categories]);
  
  const activeCategory = useMemo(() => categories.find(c => c.id === activeCategoryId), [activeCategoryId, categories]);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-300 rounded-lg w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="flex justify-center flex-wrap gap-3 mb-12">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-full w-32 animate-pulse"></div>)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg h-96 animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (parentCategories.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
         <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-brand-gray-900">O Melhor de Cada Categoria</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore os produtos mais bem avaliados em nossas principais categorias.
          </p>
        </div>
        
        <div className="flex justify-center flex-wrap gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {parentCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 text-sm md:text-base transform hover:-translate-y-1 ${
                activeCategoryId === cat.id
                  ? 'bg-brand-blue text-white shadow-lg'
                  : 'bg-brand-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
        
        {activeCategory && displayedProducts.length > 0 && (
           <div className="mt-12 text-center animate-fade-in-up">
              <Link
                href={`/catalog/${activeCategory.slug}`}
                className="inline-flex items-center gap-2 bg-brand-red text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-brand-red-dark transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Ver todos em {activeCategory.name}
                <ArrowRight className="w-5 h-5" />
              </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryHighlightsSection;