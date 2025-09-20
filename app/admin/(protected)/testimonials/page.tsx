'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, AlertTriangle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Testimonial } from '@/types';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const TestimonialFormModal = dynamic(() => import('@/components/TestimonialFormModal'), {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    )
});

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const testimonialsCollection = collection(db, 'testimonials');
      const testimonialSnapshot = await getDocs(testimonialsCollection);
      const testimonialsList = testimonialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Testimonial[];
      setTestimonials(testimonialsList);
    } catch (err) {
      console.error("Error fetching testimonials: ", err);
      setError('Não foi possível carregar os depoimentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!db) {
      setError("A configuração do banco de dados não foi encontrada.");
      setLoading(false);
      return;
    }
    fetchData();
  }, []);

  const handleOpenModal = (testimonial: Testimonial | null = null) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(false);
  };

  const handleSaveTestimonial = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let newImage = selectedTestimonial?.image || null;

      if (formData.imageFile) {
        const authRes = await fetch('/api/imagekit-auth');
        const authData = await authRes.json();
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.imageFile);
        uploadFormData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
        uploadFormData.append('signature', authData.signature);
        uploadFormData.append('expire', authData.expire);
        uploadFormData.append('token', authData.token);
        uploadFormData.append('fileName', formData.imageFile.name);

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: uploadFormData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Falha no upload da imagem.');
        
        newImage = { url: uploadData.url, fileId: uploadData.fileId };
        
        if (selectedTestimonial?.image?.fileId) {
          await fetch('/api/delete-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: selectedTestimonial.image.fileId }) });
        }
      }

      if (!newImage) throw new Error("A imagem do depoimento é obrigatória.");

      const testimonialData = {
        name: formData.name,
        quote: formData.quote,
        image: newImage,
      };

      if (selectedTestimonial) {
        await updateDoc(doc(db, 'testimonials', selectedTestimonial.id), testimonialData);
      } else {
        await addDoc(collection(db, 'testimonials'), testimonialData);
      }
      
      handleCloseModal();
      await fetchData();
    } catch (err: any) {
      console.error("Erro ao salvar depoimento: ", err);
      setError(err.message || 'Ocorreu um erro ao salvar o depoimento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (testimonial: Testimonial) => {
    if (!window.confirm(`Tem certeza que deseja excluir o depoimento de "${testimonial.name}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'testimonials', testimonial.id));
      if (testimonial.image?.fileId) {
         await fetch('/api/delete-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: testimonial.image.fileId }) });
      }
      await fetchData();
    } catch (err) {
      console.error("Erro ao excluir depoimento: ", err);
      alert('Ocorreu um erro ao excluir o depoimento.');
    }
  };

  const renderTable = () => {
    if (loading) return <tr><td colSpan={4} className="text-center py-10">Carregando...</td></tr>;
    if (error) return <tr><td colSpan={4} className="text-center py-10 text-red-600">{error}</td></tr>;
    if (testimonials.length === 0) return <tr><td colSpan={4} className="text-center py-10">Nenhum depoimento encontrado.</td></tr>;

    return testimonials.map((testimonial) => (
      <tr key={testimonial.id} className="hover:bg-gray-50">
        <td className="px-6 py-4"><Image src={testimonial.image.url} alt={testimonial.name} width={48} height={48} className="h-12 w-12 object-cover rounded-full" /></td>
        <td className="px-6 py-4 font-medium">{testimonial.name}</td>
        <td className="px-6 py-4"><p className="text-sm text-gray-600 truncate max-w-md">“{testimonial.quote}”</p></td>
        <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-2">
                <button onClick={() => handleOpenModal(testimonial)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteTestimonial(testimonial)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
            </div>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold">Gerenciar Depoimentos</h1>
        <button onClick={() => handleOpenModal()} className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md">
          <PlusCircle className="w-5 h-5" /> Adicionar Depoimento
        </button>
      </div>
      {error && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto border">
        <table className="min-w-full divide-y">
          <thead className="bg-brand-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Foto</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Nome</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Depoimento</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">{renderTable()}</tbody>
        </table>
      </div>
      <TestimonialFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveTestimonial} testimonial={selectedTestimonial} isSubmitting={isSubmitting} />
    </>
  );
}