// @/components/SearchResultsDropdown.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product, Category } from '@/types';
import { Search } from 'lucide-react';

interface SearchResultsDropdownProps {
  results: {
    products: Product[];
    categories: Category[];
    brands: string[];
  } | null;
  query: string;
  onClose: () => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, query, onClose }) => {
    const hasResults = results && (results.products.length > 0 || results.categories.length > 0 || results.brands.length > 0);

    const formattedPrice = (price: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(price);

    const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-[70vh] flex flex-col animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
            <div className="overflow-y-auto">
                {!hasResults && (
                    <div className="p-6 text-center text-sm text-gray-500">
                        <p>Nenhum resultado encontrado para "{query}"</p>
                    </div>
                )}

                {results?.brands && results.brands.length > 0 && (
                    <div className="p-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Marcas</h4>
                        <ul className="space-y-1">
                            {results.brands.map(brand => (
                                <li key={brand}>
                                    <Link href={`/catalog?q=${encodeURIComponent(brand)}`} onClick={onClose} className="block p-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                                        <span>Buscar por </span>
                                        <span className="font-semibold"><HighlightedText text={brand} highlight={query} /></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {results?.categories && results.categories.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categorias</h4>
                        <ul className="space-y-1">
                            {results.categories.map(category => (
                                <li key={category.id}>
                                    <Link href={`/catalog/${category.slug}`} onClick={onClose} className="block p-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 font-semibold">
                                        <HighlightedText text={category.name} highlight={query} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {results?.products && results.products.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Produtos</h4>
                        <ul className="space-y-2">
                            {results.products.map(product => (
                                <li key={product.id}>
                                    <Link href={`/catalog?q=${encodeURIComponent(product.name)}`} onClick={onClose} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-100">
                                        <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded">
                                            <Image 
                                                src={product.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                                                alt={product.name}
                                                layout="fill"
                                                objectFit="cover"
                                                className="rounded"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                <HighlightedText text={product.name} highlight={query} />
                                            </p>
                                            <p className="text-sm font-bold text-brand-blue">{formattedPrice(product.price)}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            <div className="border-t border-gray-200 bg-gray-50 mt-auto">
                <Link href={`/catalog?q=${encodeURIComponent(query)}`} onClick={onClose} className="flex items-center justify-center gap-2 w-full p-3 text-sm font-semibold text-brand-blue hover:bg-gray-100 transition-colors">
                    <Search className="w-4 h-4" />
                    Ver todos os resultados
                </Link>
            </div>
        </div>
    );
}

export default SearchResultsDropdown;
