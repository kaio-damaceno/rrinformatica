'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, Heart, ShoppingCart } from 'lucide-react';
import type { Category, Product } from '@/types';
import Navbar from './navbar';
import { useCart } from '@/contexts/CartContext';
import SearchResultsDropdown from './SearchResultsDropdown';


// --- Helper Hooks & Functions ---

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const normalizeText = (text: string = '') => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};


// --- Component ---

interface HeaderProps {
  logoUrl?: string | null;
  loading: boolean;
  categories: Category[];
  products: Product[];
}

const Header: React.FC<HeaderProps> = ({ logoUrl, loading, categories, products }) => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const [searchResults, setSearchResults] = useState<{ products: Product[]; categories: Category[]; brands: string[]; } | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDropdownVisible(false);
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      router.push(`/catalog?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  // Effect to handle clicks outside the search container to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to perform the search when the debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.length > 1 && products.length > 0) {
      const normalizedQuery = normalizeText(debouncedSearchQuery);
      
      const foundProducts = products.filter(p => normalizeText(p.name).includes(normalizedQuery)).slice(0, 4);
      
      const foundCategories = categories.filter(c => normalizeText(c.name).includes(normalizedQuery)).slice(0, 3);
      
      const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean) as string[])];
      const foundBrands = allBrands.filter(b => normalizeText(b).includes(normalizedQuery)).slice(0, 3);
      
      if (foundProducts.length > 0 || foundCategories.length > 0 || foundBrands.length > 0) {
        setSearchResults({ products: foundProducts, categories: foundCategories, brands: foundBrands });
      } else {
        setSearchResults(null);
      }
      setIsDropdownVisible(true);
    } else {
      setSearchResults(null);
      setIsDropdownVisible(false);
    }
  }, [debouncedSearchQuery, products, categories]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - White */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                {loading ? (
                  <div className="w-40 h-8 bg-gray-200 rounded animate-pulse" />
                ) : logoUrl ? (
                  <Image src={logoUrl} alt="Logo Impres" width={160} height={40} style={{ height: '40px', width: 'auto' }} priority />
                ) : (
                  <span className="text-3xl font-bold tracking-tighter text-brand-gray-900">Impres</span>
                )}
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-grow max-w-2xl mx-4" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="search"
                  placeholder="Busque aqui seu produto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery.length > 1) setIsDropdownVisible(true); }}
                  autoComplete="off"
                  className="w-full pl-5 pr-12 py-3 text-sm text-gray-800 bg-brand-gray-100 border-transparent border-2 focus:border-brand-blue rounded-lg focus:outline-none focus:ring-0 transition-colors"
                  aria-label="Buscar produto"
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-4 text-brand-blue hover:text-blue-700 transition-colors" aria-label="Buscar">
                  <Search className="w-5 h-5" />
                </button>
              </form>
               {isDropdownVisible && (
                <SearchResultsDropdown 
                  results={searchResults} 
                  query={searchQuery}
                  onClose={() => setIsDropdownVisible(false)}
                />
              )}
            </div>
            
            {/* User Actions */}
            <div className="hidden lg:flex items-center space-x-6 text-brand-gray-800">
              <Link href="/admin/login" className="flex items-center gap-3 text-left text-sm font-semibold hover:text-brand-blue transition-colors">
                <User className="w-8 h-8 flex-shrink-0"/>
                <div>
                    <span>Olá, faça seu login</span>
                    <br/>
                    <span className="font-normal text-gray-600">ou cadastre-se</span>
                </div>
              </Link>
              <Link href="#" className="hover:text-brand-blue transition-colors" aria-label="Favoritos">
                <Heart className="w-7 h-7" />
              </Link>
              <Link href="/cart" className="relative hover:text-brand-blue transition-colors" aria-label="Carrinho de compras">
                <ShoppingCart className="w-7 h-7" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar - Megamenu Navbar */}
      <Navbar loading={loading} categories={categories} />
    </header>
  );
};

export default Header;
