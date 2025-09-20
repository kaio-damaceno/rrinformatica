'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, where, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Category } from '@/types';
import dynamic from 'next/dynamic';

const CategoryFormModal = dynamic(() => import('@/components/CategoryFormModal'), {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    )
});

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const categoriesMap = useMemo(() => {
        return new Map(categories.map(c => [c.id, c.name]));
    }, [categories]);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const categoriesCollection = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesCollection);
            const categoriesList = categorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Category[];
            setCategories(categoriesList);
        } catch (err) {
            console.error("Error fetching categories: ", err);
            setError('Não foi possível carregar as categorias. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!db) {
            setError("A configuração do banco de dados não foi encontrada. Verifique as credenciais do Firebase.");
            setLoading(false);
            return;
        }
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        if (!searchTerm) {
            return categories;
        }
        return categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleOpenModal = (category: Category | null = null) => {
        clearMessages();
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedCategory(null);
        setIsModalOpen(false);
    };

    const handleSaveCategory = async (formData: { name: string; slug: string; parentId: string }) => {
        setIsSubmitting(true);
        clearMessages();
        try {
            const categoryData: { name: string; slug: string; parentId?: string | null } = {
                name: formData.name,
                slug: formData.slug,
                parentId: formData.parentId || null,
            };

            if (selectedCategory) {
                const categoryDoc = doc(db, 'categories', selectedCategory.id);
                await updateDoc(categoryDoc, categoryData);
                setSuccess(`Categoria "${formData.name}" atualizada com sucesso!`);
            } else {
                await addDoc(collection(db, 'categories'), categoryData);
                setSuccess(`Categoria "${formData.name}" criada com sucesso!`);
            }

            handleCloseModal();
            await fetchCategories();
        } catch (err) {
            console.error("Erro ao salvar categoria: ", err);
            setError('Ocorreu um erro ao salvar a categoria.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
              clearMessages();
            }, 5000);
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        clearMessages();
        // Check for child categories
        const childQuery = query(collection(db, 'categories'), where("parentId", "==", category.id));
        const childSnapshot = await getDocs(childQuery);
        if (!childSnapshot.empty) {
            setError(`Não é possível excluir. A categoria "${category.name}" é pai de ${childSnapshot.size} outra(s) categoria(s).`);
             setTimeout(clearMessages, 5000);
            return;
        }

        if (!window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            return;
        }
        
        try {
            const categoryDoc = doc(db, 'categories', category.id);
            await deleteDoc(categoryDoc);
            await fetchCategories();
            setSuccess(`Categoria "${category.name}" excluída com sucesso!`);
        } catch (err) {
            console.error("Erro ao excluir categoria: ", err);
            setError('Ocorreu um erro ao excluir a categoria. Verifique se não há produtos associados a ela.');
        } finally {
             setTimeout(clearMessages, 5000);
        }
    };

    const renderTableBody = () => {
        if (loading) {
            return <tr><td colSpan={4} className="text-center py-10 text-gray-500">Carregando categorias...</td></tr>;
        }
        if (error && categories.length === 0) {
            return <tr><td colSpan={4} className="text-center py-10 text-red-600">{error}</td></tr>;
        }
        if (filteredCategories.length === 0) {
            return <tr><td colSpan={4} className="text-center py-10 text-gray-500">{searchTerm ? `Nenhuma categoria encontrada para "${searchTerm}".` : 'Nenhuma categoria encontrada.'}</td></tr>;
        }
        return filteredCategories.map((category) => (
            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{category.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{category.parentId ? categoriesMap.get(category.parentId) : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(category)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-full hover:bg-indigo-50"><Edit className="w-5 h-5" /></button>
                        <button onClick={() => handleDeleteCategory(category)} className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
                    </div>
                </td>
            </tr>
        ));
    };

    if (!db) {
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex">
              <div className="py-1"><AlertTriangle className="h-6 w-6 text-yellow-500 mr-4"/></div>
              <div>
                <p className="text-xl font-bold text-yellow-800">Erro de Configuração</p>
                <p className="text-yellow-700 mt-1">
                  A conexão com o banco de dados não foi estabelecida. Verifique se as credenciais do Firebase (variáveis de ambiente) estão configuradas corretamente.
                </p>
              </div>
            </div>
          </div>
        );
    }

    return (
        <>
            <div className="mb-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h1 className="text-4xl font-bold text-brand-gray-900">Gerenciar Categorias</h1>
                    <button onClick={() => handleOpenModal()} className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
                        <PlusCircle className="w-5 h-5" />
                        Adicionar Categoria
                    </button>
                </div>
            </div>
            
            <div className="mb-6">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                </div>
            </div>

            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-brand-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Nome da Categoria</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Slug</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Categoria Pai</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>
            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveCategory}
                category={selectedCategory}
                categories={categories}
                isSubmitting={isSubmitting}
            />
        </>
    );
}