'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { Category } from '@/types';

interface NavbarProps {
  categories: Category[];
  loading: boolean;
}

interface CategoryNode extends Category {
    children: CategoryNode[];
}

const Navbar: React.FC<NavbarProps> = ({ categories, loading }) => {

    const categoryHierarchy = useMemo(() => {
        if (loading || !categories || categories.length === 0) return [];
        
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

        // Optional: sort roots and children alphabetically
        roots.sort((a,b) => a.name.localeCompare(b.name));
        roots.forEach(root => root.children.sort((a,b) => a.name.localeCompare(b.name)));

        return roots;
    }, [categories, loading]);

    if (loading) {
        return (
             <div className="bg-white border-b border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-6 h-12">
                         {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                        ))}
                    </nav>
                </div>
            </div>
        )
    }

    if (!categories || categories.length === 0) {
         return (
             <div className="bg-white border-b border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-6 h-12">
                        <span className="text-sm text-gray-400">Nenhuma categoria para exibir.</span>
                    </nav>
                </div>
            </div>
        )
    }

  return (
    <div className="bg-white border-b border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 h-12">
            {categoryHierarchy.map(parentCat => (
                <div key={parentCat.id} className="group relative h-full flex items-center">
                    <Link
                        href={`/catalog/${parentCat.slug}`}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-blue transition-colors font-medium px-4 h-full"
                    >
                        {parentCat.name}
                        {parentCat.children.length > 0 && <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />}
                    </Link>

                    {parentCat.children.length > 0 && (
                        <div className="absolute top-full left-0 w-auto min-w-[200px] bg-white border border-gray-200 shadow-lg rounded-b-lg p-4
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2 z-20">
                            <ul className="space-y-2">
                                {parentCat.children.map(childCat => (
                                    <li key={childCat.id}>
                                        <Link 
                                            href={`/catalog/${childCat.slug}`}
                                            className="block text-sm text-gray-700 hover:text-brand-blue hover:bg-gray-100 p-2 rounded-md transition-colors"
                                        >
                                            {childCat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;