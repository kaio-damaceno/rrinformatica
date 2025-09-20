'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, AlertTriangle, Image as ImageIcon, Search, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Product, Category } from '@/types';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const ProductFormModal = dynamic(() => import('@/components/ProductFormModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
    </div>
  )
});

const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock > 10) {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Em Estoque ({stock})</span>;
  }
  if (stock > 0) {
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Baixo Estoque ({stock})</span>;
  }
  return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Esgotado</span>;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriesMap = useMemo(() => {
    return new Map(categories.map(c => [c.id, c.name]));
  }, [categories]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const productsCollection = collection(db, 'products');
      const categoriesCollection = collection(db, 'categories');
      
      const [productSnapshot, categorySnapshot] = await Promise.all([
        getDocs(productsCollection),
        getDocs(categoriesCollection)
      ]);

      const productsList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);

      const categoriesList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      })) as Category[];
      setCategories(categoriesList);

    } catch (err) {
      console.error("Error fetching data: ", err);
      setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
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
    fetchData();
  }, []);
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
        return products;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return products.filter(product =>
        product.name.toLowerCase().includes(lowercasedFilter) ||
        (categoriesMap.get(product.categoryId || '') || '').toLowerCase().includes(lowercasedFilter)
    );
  }, [products, searchTerm, categoriesMap]);

  const handleOpenModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleSaveProduct = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let newImage = selectedProduct?.images[0] || null;

      if (formData.imageFile) {
        const authRes = await fetch('/api/imagekit-auth');
        if (!authRes.ok) throw new Error('Falha ao autenticar com o serviço de imagem.');
        const authData = await authRes.json();
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.imageFile);
        uploadFormData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
        uploadFormData.append('signature', authData.signature);
        uploadFormData.append('expire', authData.expire);
        uploadFormData.append('token', authData.token);
        uploadFormData.append('fileName', formData.imageFile.name);

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
            throw new Error(uploadData.message || 'Falha no upload da imagem.');
        }
        
        newImage = { url: uploadData.url, fileId: uploadData.fileId };
        
        if (selectedProduct?.images?.[0]?.fileId) {
            await fetch('/api/delete-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId: selectedProduct.images[0].fileId }),
            });
        }
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        mp_payment_link: formData.mp_payment_link,
        description: formData.description || '',
        categoryId: formData.categoryId || '',
        images: newImage ? [newImage] : [],
      };

      if (selectedProduct) {
        const productDoc = doc(db, 'products', selectedProduct.id);
        await updateDoc(productDoc, productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      
      handleCloseModal();
      await fetchData();

    } catch (err: any) {
      console.error("Erro ao salvar produto: ", err);
      setError(err.message || 'Ocorreu um erro ao salvar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      return;
    }
    try {
      const productDoc = doc(db, 'products', product.id);
      await deleteDoc(productDoc);

      if (product.images?.[0]?.fileId) {
         try {
            await fetch('/api/delete-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileId: product.images[0].fileId }),
            });
          } catch (imageError) {
             console.warn("Failed to delete image from ImageKit, but database entry was deleted.", imageError);
          }
      }
      
      await fetchData();

    } catch (err) {
      console.error("Erro ao excluir produto: ", err);
      alert('Ocorreu um erro ao excluir o produto.');
    }
  };

  const renderProductsTable = () => {
    if (loading) {
      return <tr><td colSpan={6} className="text-center py-10 text-gray-500">Carregando produtos...</td></tr>;
    }
    if (error && products.length === 0) {
        return <tr><td colSpan={6} className="text-center py-10 text-red-600">{error}</td></tr>;
    }
    if (filteredProducts.length === 0) {
        return <tr><td colSpan={6} className="text-center py-10 text-gray-500">{searchTerm ? `Nenhum produto encontrado para "${searchTerm}".` : 'Nenhum produto encontrado.'}</td></tr>;
    }
    return filteredProducts.map((product) => {
      const categoryName = categoriesMap.get(product.categoryId || '') || 'Sem categoria';
      const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
      const imageUrl = product.images?.[0]?.url;

      return (
        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} width={48} height={48} className="h-12 w-12 object-cover rounded-md" />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
          </td>
           <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-500">{categoryName}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-semibold text-gray-800">{formattedPrice}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <StockBadge stock={product.stock} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2">
                <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-full hover:bg-indigo-50"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteProduct(product)} className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
            </div>
          </td>
        </tr>
      );
    });
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
          <h1 className="text-4xl font-bold text-brand-gray-900">Gerenciar Produtos</h1>
          <button onClick={() => handleOpenModal()} className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors transform hover:-translate-y-0.5 shadow-md hover:shadow-lg">
            <PlusCircle className="w-5 h-5" />
            Adicionar Produto
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
                  placeholder="Buscar por nome ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
          </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-brand-gray-100">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Imagem</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Nome do Produto</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Categoria</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Preço</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Estoque</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-brand-gray-800 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderProductsTable()}
          </tbody>
        </table>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
        isSubmitting={isSubmitting}
      />
    </>
  );
}