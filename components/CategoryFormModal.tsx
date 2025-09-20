'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: { name: string; slug: string; parentId: string }) => void;
  category: Category | null;
  categories: Category[];
  isSubmitting: boolean;
}

const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') 
        .replace(/[^\w-]+/g, '') 
        .replace(/--+/g, '-'); 
};

const validateSlug = (slug: string): string | null => {
    if (!slug) {
        return "O slug é obrigatório.";
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return "Use apenas letras minúsculas, números e hífens. Não pode começar, terminar ou ter hífens duplicados.";
    }
    return null; 
};


const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, category, categories, isSubmitting }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);


  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setParentId(category.parentId || '');
      setIsSlugManuallyEdited(true); 
    } else {
      setName('');
      setSlug('');
      setParentId('');
      setIsSlugManuallyEdited(false);
    }
    setSlugError(null); 
  }, [category, isOpen]);

  useEffect(() => {
    if (!isSlugManuallyEdited && name) {
        const newSlug = generateSlug(name);
        setSlug(newSlug);
        setSlugError(validateSlug(newSlug));
    }
  }, [name, isSlugManuallyEdited]);

  useEffect(() => {
    setSlugError(validateSlug(slug));
  }, [slug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(e.target.value);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSlugError = validateSlug(slug);
    if (!name.trim()) {
        alert("O nome da categoria não pode estar vazio.");
        return;
    }
    if (currentSlugError) {
        setSlugError(currentSlugError);
        alert(`O slug é inválido: ${currentSlugError}`);
        return;
    }
    onSave({ name, slug, parentId });
  };

  if (!isOpen) return null;
  
  const availableParents = categories.filter(c => c.id !== category?.id);

  const slugInputClass = `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
    slugError 
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 focus:ring-brand-blue focus:border-brand-blue'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-gray-800">{category ? 'Editar Categoria' : 'Adicionar Nova Categoria'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label>
              <input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Ex: Impressoras a Laser"
              />
            </div>
             <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug da Categoria</label>
                <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    required
                    className={slugInputClass}
                    placeholder="ex: impressoras-a-laser"
                />
                {slugError && <p className="mt-2 text-sm text-red-600">{slugError}</p>}
                {!slugError && slug && <p className="mt-2 text-sm text-green-600">Slug válido!</p>}
             </div>
             <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">Categoria Pai</label>
                <select 
                    id="parentId"
                    value={parentId}
                    onChange={e => setParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue bg-white"
                >
                    <option value="">Nenhuma (Categoria Principal)</option>
                    {availableParents.map(parentCat => (
                        <option key={parentCat.id} value={parentCat.id}>{parentCat.name}</option>
                    ))}
                </select>
             </div>
          </div>
          <div className="pt-6 border-t border-gray-200 mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || !!slugError} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-blue-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;