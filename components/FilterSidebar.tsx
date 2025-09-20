// @/components/FilterSidebar.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import type { Product, Category } from '@/types';
import Link from 'next/link';
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react';

interface CategoryNode extends Category {
  children: CategoryNode[];
}

interface FilterSidebarProps {
  allProducts: Product[];
  categories: Category[];
  activeFilters: any;
  onFilterChange: (newFilters: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FilterSection: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="py-6 border-b border-gray-200">
      <button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      <div className={`mt-4 space-y-3 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ allProducts, categories, activeFilters, onFilterChange, isOpen, setIsOpen }) => {
  const [price, setPrice] = useState(activeFilters.priceRange);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(activeFilters.searchTerm);

  const categoryHierarchy = useMemo(() => {
    const categoryMap = new Map<string, CategoryNode>();
    categories.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [] }));
    const roots: CategoryNode[] = [];
    categories.forEach(cat => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [categories]);

  const availableBrands = useMemo(() => {
    const brands = allProducts.map(p => p.brand).filter(Boolean) as string[];
    return [...new Set(brands)].sort();
  }, [allProducts]);

  const availableConditions = ['novo', 'usado', 'recondicionado', 'semi-novo'];

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrice((prev: any) => ({ ...prev, [name]: value }));
  };
  
  // Validate price range whenever it changes
  useEffect(() => {
    const min = parseFloat(price.min);
    const max = parseFloat(price.max);

    if (!isNaN(min) && !isNaN(max) && min > max) {
        setPriceError('O valor mínimo não pode ser maior que o máximo.');
    } else {
        setPriceError(null);
    }
  }, [price]);


  const handleApplyPrice = () => {
    if (priceError) return; // Block applying filter if there's an error
    onFilterChange({ priceRange: price });
  };
  
  const handleCheckboxChange = (filterType: 'brands' | 'conditions', value: string) => {
    const currentValues = activeFilters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ [filterType]: newValues });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ searchTerm });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, onFilterChange]);


  const SidebarContent = () => (
    <div className="bg-white lg:bg-transparent h-full flex flex-col">
       <div className="p-6 border-b border-gray-200 lg:hidden flex justify-between items-center">
        <h2 className="text-xl font-bold">Filtros</h2>
        <button onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></button>
      </div>

      <div className="overflow-y-auto p-6 flex-grow">
        <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 h-5 text-gray-400" /></span>
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
        </div>

        <FilterSection title="Categorias">
          <ul className="space-y-2">
             <li>
                <Link href="/catalog" className={`block text-sm font-medium ${!activeFilters.categoryId ? 'text-brand-blue' : 'text-gray-600 hover:text-brand-blue'}`}>
                  Todas as Categorias
                </Link>
            </li>
            {categoryHierarchy.map(cat => (
              <li key={cat.id}>
                <Link href={`/catalog/${cat.slug}`} className={`block text-sm font-medium ${activeFilters.categoryId === cat.id ? 'text-brand-blue' : 'text-gray-600 hover:text-brand-blue'}`}>
                  {cat.name}
                </Link>
                {cat.children.length > 0 && activeFilters.categoryId === cat.id && (
                  <ul className="pl-4 mt-2 space-y-2 border-l">
                    {cat.children.map(child => (
                      <li key={child.id}>
                         <Link href={`/catalog/${child.slug}`} className="block text-sm text-gray-500 hover:text-brand-blue">
                            {child.name}
                         </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </FilterSection>

        <FilterSection title="Preço">
          <div>
            <div className="flex items-center gap-2">
              <input type="number" name="min" placeholder="Mín" value={price.min} onChange={handlePriceChange} className="w-full p-2 border rounded-md text-sm" />
              <span className="text-gray-400">-</span>
              <input type="number" name="max" placeholder="Máx" value={price.max} onChange={handlePriceChange} className="w-full p-2 border rounded-md text-sm" />
              <button onClick={handleApplyPrice} disabled={!!priceError} className="p-2 bg-brand-blue text-white rounded-md text-sm font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">OK</button>
            </div>
            {priceError && <p className="text-red-600 text-xs mt-2">{priceError}</p>}
          </div>
        </FilterSection>

        <FilterSection title="Marcas">
            {availableBrands.map(brand => (
                <label key={brand} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={activeFilters.brands.includes(brand)} onChange={() => handleCheckboxChange('brands', brand)} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
                    {brand}
                </label>
            ))}
        </FilterSection>

        <FilterSection title="Condição">
            {availableConditions.map(condition => (
                <label key={condition} className="flex items-center gap-2 text-sm capitalize">
                    <input type="checkbox" checked={activeFilters.conditions.includes(condition)} onChange={() => handleCheckboxChange('conditions', condition)} className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"/>
                    {condition}
                </label>
            ))}
        </FilterSection>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <aside className={`fixed top-0 left-0 w-80 h-full bg-white z-50 transform transition-transform lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24">
            <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;
