'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';
import type { Testimonial } from '@/types';

interface TestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  testimonial: Testimonial | null;
  isSubmitting: boolean;
}

const TestimonialFormModal: React.FC<TestimonialFormModalProps> = ({ isOpen, onClose, onSave, testimonial, isSubmitting }) => {
  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (testimonial) {
      setName(testimonial.name);
      setQuote(testimonial.quote);
      setImagePreview(testimonial.image.url);
      setImageFile(null);
    } else {
      setName('');
      setQuote('');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [testimonial, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonial && !imageFile) {
        alert("A imagem é obrigatória para um novo depoimento.");
        return;
    }
    onSave({ name, quote, imageFile });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold">{testimonial ? 'Editar Depoimento' : 'Adicionar Depoimento'}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">Depoimento</label>
              <textarea id="quote" value={quote} onChange={(e) => setQuote(e.target.value)} required rows={5} className="w-full px-3 py-2 border rounded-md"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="space-y-1 text-center">
                   {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md"/> : <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />}
                   <p className="text-sm text-gray-600">{imagePreview ? 'Clique para alterar a imagem' : 'Clique para carregar uma imagem'}</p>
                   <input ref={fileInputRef} id="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*"/>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-white py-2 px-4 border rounded-md">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 border rounded-md text-white bg-brand-blue hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialFormModal;