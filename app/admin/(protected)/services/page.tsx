'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Service } from '@/types';
import dynamic from 'next/dynamic';

const ServiceFormModal = dynamic(() => import('@/components/ServiceFormModal'), {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    )
});

export default function AdminServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const servicesCollection = collection(db, 'services');
            const serviceSnapshot = await getDocs(servicesCollection);
            const servicesList = serviceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Service[];
            setServices(servicesList);
        } catch (err) {
            console.error("Error fetching services: ", err);
            setError('Não foi possível carregar os serviços. Tente novamente mais tarde.');
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
        fetchServices();
    }, []);

    const handleOpenModal = (service: Service | null = null) => {
        clearMessages();
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedService(null);
        setIsModalOpen(false);
    };

    const handleSaveService = async (formData: { title: string; description: string; icon: string; actionType: 'link' | 'whatsapp' | 'none'; actionValue: string; }) => {
        setIsSubmitting(true);
        clearMessages();
        try {
            const serviceData = { ...formData };
            if (serviceData.actionType === 'none') {
                serviceData.actionValue = '';
            }

            if (selectedService) {
                const serviceDoc = doc(db, 'services', selectedService.id);
                await updateDoc(serviceDoc, serviceData);
                setSuccess(`Serviço "${formData.title}" atualizado com sucesso!`);
            } else {
                await addDoc(collection(db, 'services'), serviceData);
                setSuccess(`Serviço "${formData.title}" criado com sucesso!`);
            }
            handleCloseModal();
            await fetchServices();
        } catch (err) {
            console.error("Erro ao salvar serviço: ", err);
            setError('Ocorreu um erro ao salvar o serviço.');
        } finally {
            setIsSubmitting(false);
            setTimeout(clearMessages, 5000);
        }
    };

    const handleDeleteService = async (service: Service) => {
        if (!window.confirm(`Tem certeza que deseja excluir o serviço "${service.title}"?`)) return;
        clearMessages();
        try {
            await deleteDoc(doc(db, 'services', service.id));
            await fetchServices();
            setSuccess(`Serviço "${service.title}" excluído com sucesso!`);
        } catch (err) {
            console.error("Erro ao excluir serviço: ", err);
            setError('Ocorreu um erro ao excluir o serviço.');
        } finally {
            setTimeout(clearMessages, 5000);
        }
    };

    const renderTableBody = () => {
        if (loading) return <tr><td colSpan={5} className="text-center py-10 text-gray-500">Carregando serviços...</td></tr>;
        if (error && services.length === 0) return <tr><td colSpan={5} className="text-center py-10 text-red-600">{error}</td></tr>;
        if (services.length === 0) return <tr><td colSpan={5} className="text-center py-10 text-gray-500">Nenhum serviço encontrado.</td></tr>;
        
        return services.map((service) => {
            const IconComponent = (LucideIcons as any)[service.icon] ?? HelpCircle;
            return (
                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{service.title}</div></td>
                    <td className="px-6 py-4"><p className="text-sm text-gray-500 truncate max-w-sm">{service.description}</p></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <IconComponent className="w-5 h-5" /> {service.icon}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {(!service.actionType || service.actionType === 'none') && <span className="text-xs text-gray-400">Nenhuma</span>}
                        {service.actionType === 'link' && <span className="text-xs font-mono text-blue-600 block truncate max-w-[150px]" title={service.actionValue}>Link</span>}
                        {service.actionType === 'whatsapp' && <span className="text-xs font-mono text-green-600">WhatsApp</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModal(service)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"><Edit className="w-5 h-5" /></button>
                            <button onClick={() => handleDeleteService(service)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </td>
                </tr>
            );
        });
    };

    if (!db) return <p>Database not configured.</p>;

    return (
        <>
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-4xl font-bold text-brand-gray-900">Gerenciar Serviços</h1>
                <button onClick={() => handleOpenModal()} className="bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md">
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Serviço
                </button>
            </div>
            {success && <div className="bg-green-100 border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
            {error && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <div className="bg-white shadow-lg rounded-xl overflow-x-auto border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-brand-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase">Título</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase">Descrição</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase">Ícone</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-brand-gray-800 uppercase">Ação</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-brand-gray-800 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">{renderTableBody()}</tbody>
                </table>
            </div>
            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveService}
                service={selectedService}
                isSubmitting={isSubmitting}
            />
        </>
    );
}