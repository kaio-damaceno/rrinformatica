'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Product, Category } from '@/types';
import { DollarSign, Package, Tag, AlertTriangle, Archive } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex flex-col">
    <div className="flex justify-between items-start">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-brand-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-blue-100 p-3 rounded-full">{icon}</div>
    </div>
    {description && <p className="text-xs text-gray-400 mt-4">{description}</p>}
  </div>
);

const CategoryDistributionChart: React.FC<{ products: Product[], categories: Category[] }> = ({ products, categories }) => {
  const data = useMemo(() => {
    if (!products.length || !categories.length) return [];
    
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const counts = new Map<string, number>();
    
    products.forEach(p => {
      const categoryId = p.categoryId || 'unassigned';
      counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
    });
    
    const totalProducts = products.length;
    if (totalProducts === 0) return [];

    const chartData = Array.from(counts.entries()).map(([id, count]) => ({
      name: categoryMap.get(id) || 'Sem Categoria',
      value: count,
      percentage: (count / totalProducts) * 100,
    })).sort((a, b) => b.value - a.value);

    return chartData;
  }, [products, categories]);

  const colors = ['#2563EB', '#60A5FA', '#3B82F6', '#93C5FD', '#1D4ED8', '#DBEAFE'];

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
        <h3 className="text-lg font-bold text-brand-gray-900 mb-4">Distribuição por Categoria</h3>
        <div className="flex-grow flex items-center justify-center text-center">
            <p className="text-gray-500">Não há dados de produtos ou categorias para exibir o gráfico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
      <h3 className="text-lg font-bold text-brand-gray-900 mb-4">Distribuição por Categoria</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center flex-grow">
        <div className="relative w-full h-full flex items-center justify-center min-h-[200px]">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            {data.map((segment, index) => {
              const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercentage / 100) * circumference;
              accumulatedPercentage += segment.percentage;

              return (
                <circle
                  key={index}
                  r={radius}
                  cx="100"
                  cy="100"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="40"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
        </div>
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={item.name} className="flex items-center text-sm">
              <span className="w-3 h-3 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
              <span className="font-medium text-gray-700 truncate pr-2">{item.name}</span>
              <span className="ml-auto text-gray-500 whitespace-nowrap">{item.percentage.toFixed(1)}% ({item.value})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const LowStockProducts: React.FC<{ products: Product[] }> = ({ products }) => {
    const lowStockItems = useMemo(() => {
        return products
            .filter(p => p.stock > 0 && p.stock <= 10)
            .sort((a, b) => a.stock - b.stock);
    }, [products]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-brand-gray-900 mb-4">Produtos com Baixo Estoque</h3>
            {lowStockItems.length > 0 ? (
                <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {lowStockItems.map((product) => (
                        <li key={product.id} className="flex justify-between items-center text-sm">
                            <p className="font-semibold text-gray-800 truncate pr-4">{product.name}</p>
                            <span className="flex-shrink-0 px-2 py-1 text-xs font-bold text-yellow-800 bg-yellow-100 rounded-full">
                                {product.stock} unid.
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                   <div className="bg-green-100 p-3 rounded-full mb-3">
                     <Package className="w-6 h-6 text-green-700" />
                   </div>
                   <p className="font-semibold text-green-800">Tudo certo!</p>
                   <p className="text-sm text-gray-500">Nenhum produto com baixo estoque.</p>
                </div>
            )}
        </div>
    );
};


export default function AdminReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (!db) {
        setError("A configuração do banco de dados não foi encontrada.");
        setLoading(false);
        return;
      }
      try {
        const productsCollection = collection(db, 'products');
        const categoriesCollection = collection(db, 'categories');
        
        const [productSnapshot, categorySnapshot] = await Promise.all([
          getDocs(productsCollection),
          getDocs(categoriesCollection)
        ]);

        const productsList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(productsList);

        const categoriesList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
        setCategories(categoriesList);
      } catch (err) {
        console.error("Erro ao buscar dados para relatórios: ", err);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const reportStats = useMemo(() => {
    const totalInventoryValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return {
      totalProducts: products.length,
      activeCategories: categories.length,
      totalInventoryValue,
      outOfStockCount
    };
  }, [products, categories]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg font-semibold text-gray-700">Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
     return (
       <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
        <div className="flex">
          <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4"/></div>
          <div>
            <p className="text-xl font-bold text-red-800">Erro ao Carregar Relatórios</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
     );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-brand-gray-900">Relatórios e Análises</h1>
        <p className="text-lg text-gray-600 mt-2">Acompanhe o desempenho da sua loja com dados reais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
         <StatCard 
          title="Total de Produtos"
          value={reportStats.totalProducts.toString()}
          icon={<Package className="w-6 h-6 text-brand-blue" />}
        />
         <StatCard 
          title="Valor em Estoque"
          value={formatCurrency(reportStats.totalInventoryValue)}
          icon={<DollarSign className="w-6 h-6 text-brand-blue" />}
        />
        <StatCard 
          title="Categorias Ativas"
          value={reportStats.activeCategories.toString()}
          icon={<Tag className="w-6 h-6 text-brand-blue" />}
        />
         <StatCard 
          title="Produtos Esgotados"
          value={reportStats.outOfStockCount.toString()}
          icon={<Archive className="w-6 h-6 text-brand-blue" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <CategoryDistributionChart products={products} categories={categories} />
        </div>
        <div>
            <LowStockProducts products={products} />
        </div>
      </div>
    </div>
  );
};
