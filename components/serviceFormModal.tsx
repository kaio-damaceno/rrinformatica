'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Service } from '@/types';
import * as LucideIcons from 'lucide-react';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: { title: string; description: string; icon: string; actionType: 'link' | 'whatsapp' | 'none'; actionValue: string; }) => void;
  service: Service | null;
  isSubmitting: boolean;
}

// FIX: The type `keyof typeof LucideIcons` is too broad (string | number | symbol), which is incompatible with React key props and other string-only props.
// Using Extract to only allow string keys, which resolves the type errors.
const availableIcons: Extract<keyof typeof LucideIcons, string>[] = ['Printer', 'Droplets', 'Laptop', 'Wrench', 'ShoppingCart', 'PaintBucket', 'ShieldCheck', 'Truck', 'Cog', 'Camera'];

const IconPicker: React.FC<{ selected: string; onSelect: (iconName: string) => void }> = ({ selected, onSelect }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {availableIcons.map(iconName => {
                    const IconComponent = (LucideIcons as any)[iconName];
                    const isSelected = selected === iconName;
                    return (
                        <button
                            type="button"
                            key={iconName}
                            onClick={() => onSelect(iconName)}
                            className={`p-3 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-blue bg-blue-50 ring-2 ring-brand-blue' : 'border-gray-200 hover:border-gray-400'}`}
                            aria-label={iconName}
                        >
                            <IconComponent className={`w-6 h-6 ${isSelected ? 'text-brand-blue' : 'text-gray-500'}`} />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSave, service, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Printer');
  const [actionType, setActionType] = useState<'link' | 'whatsapp' | 'none'>('none');
  const [actionValue, setActionValue] = useState('');

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);
      setIcon(service.icon);
      setActionType(service.actionType || 'none');
      setActionValue(service.actionValue || '');
    } else {
      setTitle('');
      setDescription('');
      setIcon('Printer');
      setActionType('none');
      setActionValue('');
    }
  }, [service, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !icon) {
        alert("Todos os campos são obrigatórios.");
        return;
    }
    onSave({ title, description, icon, actionType, actionValue });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-brand-gray-800">{service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título do Serviço</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue" />
            </div>
            <IconPicker selected={icon} onSelect={setIcon} />

            <div className="pt-6 border-t mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Ação do Serviço (Opcional)</h3>
                <div className="space-y-4">
                    <div>
                    <label htmlFor="actionType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ação</label>
                    <select 
                        id="actionType" 
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as 'link' | 'whatsapp' | 'none')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-brand-blue"
                    >
                        <option value="none">Nenhuma Ação</option>
                        <option value="link">Link Externo</option>
                        <option value="whatsapp">Contato via WhatsApp</option>
                    </select>
                    </div>
                    {actionType === 'link' && (
                    <div>
                        <label htmlFor="actionValue" className="block text-sm font-medium text-gray-700 mb-1">URL do Link</label>
                        <input 
                        type="url" 
                        id="actionValue"
                        value={actionValue}
                        onChange={(e) => setActionValue(e.target.value)}
                        placeholder="https://exemplo.com/servico" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue"
                        />
                    </div>
                    )}
                    {actionType === 'whatsapp' && (
                    <div>
                        <label htmlFor="actionValue" className="block text-sm font-medium text-gray-700 mb-1">Número do WhatsApp</label>
                        <input 
                        type="text" 
                        id="actionValue"
                        value={actionValue}
                        onChange={(e) => setActionValue(e.target.value)}
                        placeholder="5511999998888 (com código do país)" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-blue"
                        />
                        <p className="text-xs text-gray-500 mt-1">Inclua o código do país (ex: 55 para o Brasil) e o DDD.</p>
                    </div>
                    )}
                </div>
            </div>
          </div>
          <div className="pt-6 border-t mt-6 flex justify-end gap-3 sticky bottom-0 bg-white py-4 px-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Salvando...' : 'Salvar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;