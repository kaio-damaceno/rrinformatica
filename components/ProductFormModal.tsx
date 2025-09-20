'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  product: Product | null;
  categories: Category[];
  isSubmitting: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product, categories, isSubmitting }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [mp_payment_link, setMpPaymentLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setDescription(product.description || '');
      setCategoryId(product.categoryId || '');
      setMpPaymentLink(product.mp_payment_link || '');
      setImagePreview(product.images?.[0]?.url || null);
      setImageFile(null);
    } else {
      // Reset form for new product
      setName('');
      setPrice('');
      setStock('');
      setDescription('');
      setCategoryId('');
      setMpPaymentLink('');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, price, stock, mp_payment_link, imageFile, description, categoryId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-brand-gray-800">{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"/>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" placeholder="Detalhes sobre o produto..."></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue bg-white">
                        <option value="">Selecione uma categoria</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"/>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                <input type="number" id="stock" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" step="1" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"/>
              </div>
              <div>
                <label htmlFor="mp_payment_link" className="block text-sm font-medium text-gray-700 mb-1">Link de Pagamento (Opcional)</label>
                <input type="url" id="mp_payment_link" value={mp_payment_link} onChange={(e) => setMpPaymentLink(e.target.value)} placeholder="https://mpago.la/..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-brand-blue"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                   {imagePreview ? (
                      <img src={imagePreview} alt="Pré-visualização" className="mx-auto h-32 w-auto object-contain rounded-md"/>
                   ) : (
                    <>
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <p className="pl-1">Clique para carregar uma imagem</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
                    </>
                   )}
                </div>
                 <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*"/>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-200 mt-6 flex justify-end gap-3 sticky bottom-0 bg-white py-4 px-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-blue-300">
              {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;