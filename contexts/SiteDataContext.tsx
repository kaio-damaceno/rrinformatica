'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { SiteSettings, Category, Product } from '@/types';

interface SiteDataContextType {
    settings: SiteSettings | null;
    categories: Category[];
    products: Product[];
    loading: boolean;
    error: string | null;
}

const SiteDataContext = createContext<SiteDataContextType>({
    settings: null,
    categories: [],
    products: [],
    loading: true,
    error: null,
});

export const SiteDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!db) {
                setError("A configuração do banco de dados não foi encontrada.");
                setLoading(false);
                return;
            }
            try {
                // Using Promise.all to fetch data concurrently for better performance
                const [settingsDoc, categoriesSnapshot, productsSnapshot] = await Promise.all([
                    getDoc(doc(db, 'settings', 'homepage')),
                    getDocs(collection(db, 'categories')),
                    getDocs(collection(db, 'products'))
                ]);

                if (settingsDoc.exists()) {
                    setSettings({ id: settingsDoc.id, ...settingsDoc.data() } as SiteSettings);
                } else {
                    console.warn("Documento 'settings/homepage' não encontrado.");
                }

                const categoriesList = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Category[];
                setCategories(categoriesList);

                const productsList = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(productsList);

            } catch (err) {
                console.error("Failed to fetch site data:", err);
                setError("Não foi possível carregar os dados do site.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const value = { settings, categories, products, loading, error };

    return (
        <SiteDataContext.Provider value={value}>
            {children}
        </SiteDataContext.Provider>
    );
};

export const useSiteData = () => {
    const context = useContext(SiteDataContext);
    if (context === undefined) {
        throw new Error('useSiteData must be used within a SiteDataProvider');
    }
    return context;
};