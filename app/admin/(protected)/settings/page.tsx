'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { SiteSettings } from '@/types';
import { UploadCloud, AlertTriangle, Loader2, CheckCircle, Trash2, PlusCircle } from 'lucide-react';
import Image from 'next/image';

type ImageState = {
    id?: string;
    file: File | null;
    preview: string;
    initialUrl: string;
    fileId: string;
};

const ImageUploadField: React.FC<{ label: string; imageState: ImageState; onImageChange: (file: File) => void, hint?: string }> = ({ label, imageState, onImageChange, hint }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
            <div className="mt-1 flex items-center gap-4">
                <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {imageState.preview ? (
                        <Image src={imageState.preview} alt="Pré-visualização da imagem" width={96} height={96} className="h-full w-full object-contain" />
                    ) : (
                        <UploadCloud className="h-8 w-8 text-gray-400" />
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                    Alterar Imagem
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && onImageChange(e.target.files[0])}
                    aria-label={`Upload for ${label}`}
                />
            </div>
        </div>
    );
};


export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [logoImage, setLogoImage] = useState<ImageState>({ file: null, preview: '', initialUrl: '', fileId: '' });
    const [heroImages, setHeroImages] = useState<ImageState[]>([]);
    const [galleryImages, setGalleryImages] = useState<ImageState[]>([]);
    const [promoPopupImage, setPromoPopupImage] = useState<ImageState>({ file: null, preview: '', initialUrl: '', fileId: '' });
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!db) {
                setError("A conexão com o banco de dados falhou.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const settingsDocRef = doc(db, 'settings', 'homepage');
                const settingsDoc = await getDoc(settingsDocRef);
                if (settingsDoc.exists()) {
                    const data = { id: settingsDoc.id, ...settingsDoc.data() } as SiteSettings;
                    setSettings(data);
                    
                    setLogoImage({ file: null, preview: data.logo?.url || '', initialUrl: data.logo?.url || '', fileId: data.logo?.fileId || '' });
                    
                    const heroImagesData = (data.hero.images || []).map(img => ({
                        id: img.id,
                        file: null,
                        preview: img.url,
                        initialUrl: img.url,
                        fileId: img.fileId
                    }));
                    setHeroImages(heroImagesData);
                    
                    const galleryData = data.gallery || [];
                    const fullGallery = Array.from({ length: 3 }, (_, i) => galleryData[i] || { id: `${i+1}`, url: '', fileId: '' });
                    setGalleryImages(fullGallery.map(img => ({ file: null, preview: img.url, initialUrl: img.url, fileId: img.fileId })));
                    
                    const promoPopupData = data.promoPopup || { enabled: false, title: '', description: '', buttonText: '', buttonLink: '', image: { url: '', fileId: '' } };
                    setPromoPopupImage({ file: null, preview: promoPopupData.image?.url || '', initialUrl: promoPopupData.image?.url || '', fileId: promoPopupData.image?.fileId || '' });

                } else {
                    console.warn("Documento 'settings/homepage' não encontrado. Inicializando com valores padrão para criação.");
                    const defaultSettings: SiteSettings = {
                        id: 'homepage',
                        hero: { title: '', description: '', images: []},
                        gallery: [
                            { id: '1', url: '', fileId: '' }, { id: '2', url: '', fileId: '' }, { id: '3', url: '', fileId: '' },
                        ],
                        promoPopup: { enabled: false, title: '', description: '', buttonText: '', buttonLink: '', image: { url: '', fileId: '' } },
                    };
                    setSettings(defaultSettings);
                    setLogoImage({ file: null, preview: '', initialUrl: '', fileId: '' });
                    setHeroImages([]);
                    setGalleryImages(Array.from({ length: 3 }, () => ({ file: null, preview: '', initialUrl: '', fileId: '' })));
                    setPromoPopupImage({ file: null, preview: '', initialUrl: '', fileId: '' });
                }
            } catch (e) {
                console.error("Falha ao carregar configurações: ", e);
                setError("Falha ao carregar configurações. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleLogoImageChange = (file: File) => {
        setLogoImage(prev => ({ ...prev, file, preview: URL.createObjectURL(file) }));
    };
    
    const handlePromoPopupImageChange = (file: File) => {
        setPromoPopupImage(prev => ({ ...prev, file, preview: URL.createObjectURL(file) }));
    };

    const handleHeroImageChange = (index: number, file: File) => {
        setHeroImages(prev => prev.map((img, i) => i === index ? { ...img, file, preview: URL.createObjectURL(file) } : img));
    };

    const addHeroImageSlot = () => {
        setHeroImages(prev => [...prev, { id: `new-${Date.now()}`, file: null, preview: '', initialUrl: '', fileId: '' }]);
    };

    const removeHeroImage = (index: number) => {
        const imageToRemove = heroImages[index];
        if (imageToRemove.fileId) {
            setFilesToDelete(prev => [...prev, imageToRemove.fileId]);
        }
        setHeroImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleGalleryImageChange = (index: number, file: File) => {
        setGalleryImages(prev => prev.map((img, i) => i === index ? { ...img, file, preview: URL.createObjectURL(file) } : img));
    };
    
    const uploadImage = async (file: File, oldFileId?: string) => {
        const authRes = await fetch('/api/imagekit-auth');
        if (!authRes.ok) throw new Error('Falha ao autenticar com o serviço de imagem.');
        const authData = await authRes.json();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
        formData.append('signature', authData.signature);
        formData.append('expire', authData.expire);
        formData.append('token', authData.token);
        formData.append('fileName', file.name);

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'O upload da imagem falhou.');

        if (oldFileId) {
             try {
                await fetch('/api/delete-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId: oldFileId }) });
            } catch (deleteError) {
                console.warn(`Failed to delete old image ${oldFileId}, but new one was uploaded.`, deleteError);
            }
        }
        return { url: uploadData.url, fileId: uploadData.fileId };
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const [section, field] = name.split('.');

        setSettings(prev => {
            if (!prev) return null;
            const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy

            if (section === 'hero' && (field === 'title' || field === 'description')) {
                newSettings.hero[field] = value;
            } else if (section === 'promoPopup') {
                 if (!newSettings.promoPopup) { // Ensure object exists
                    newSettings.promoPopup = {};
                }
                if (type === 'checkbox') {
                    newSettings.promoPopup[field] = checked;
                } else {
                    newSettings.promoPopup[field] = value;
                }
            }
            return newSettings;
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) {
            setError("As configurações não foram carregadas, não é possível salvar.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedSettingsData = JSON.parse(JSON.stringify(settings));

            if (logoImage.file) {
                 updatedSettingsData.logo = await uploadImage(logoImage.file, logoImage.fileId);
            }
            
            if (promoPopupImage.file) {
                 if (!updatedSettingsData.promoPopup) updatedSettingsData.promoPopup = {};
                 updatedSettingsData.promoPopup.image = await uploadImage(promoPopupImage.file, promoPopupImage.fileId);
            } else if (updatedSettingsData.promoPopup) {
                updatedSettingsData.promoPopup.image = { url: promoPopupImage.initialUrl, fileId: promoPopupImage.fileId };
            }
            
            const heroImagesUploadPromises = heroImages.map(async (img, index) => {
                if (img.file) {
                    return { ...(await uploadImage(img.file, img.fileId)), id: img.id || `${Date.now()}-${index}` };
                }
                return { url: img.initialUrl, fileId: img.fileId, id: img.id || `${Date.now()}-${index}` };
            });
            updatedSettingsData.hero.images = await Promise.all(heroImagesUploadPromises);

            if (filesToDelete.length > 0) {
                const deletePromises = filesToDelete.map(fileId => 
                    fetch('/api/delete-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileId })
                    })
                );
                await Promise.all(deletePromises);
                setFilesToDelete([]);
            }

            const galleryUploadPromises = galleryImages.map(async (img, index) => {
                if (img.file) {
                    return { ...(await uploadImage(img.file, img.fileId)), id: settings.gallery[index]?.id || `${index + 1}` };
                }
                return { url: img.initialUrl, fileId: img.fileId, id: settings.gallery[index]?.id || `${index + 1}` };
            });
            updatedSettingsData.gallery = await Promise.all(galleryUploadPromises);
            
            await setDoc(doc(db, 'settings', 'homepage'), updatedSettingsData, { merge: true });
            setSuccess("Configurações salvas com sucesso!");
            
            setSettings(updatedSettingsData);
            if (updatedSettingsData.logo) {
                setLogoImage({ file: null, preview: updatedSettingsData.logo.url, initialUrl: updatedSettingsData.logo.url, fileId: updatedSettingsData.logo.fileId });
            }
            if (updatedSettingsData.promoPopup?.image) {
                setPromoPopupImage({ file: null, preview: updatedSettingsData.promoPopup.image.url, initialUrl: updatedSettingsData.promoPopup.image.url, fileId: updatedSettingsData.promoPopup.image.fileId });
            }
            setHeroImages(updatedSettingsData.hero.images.map((img: any) => ({ ...img, file: null, preview: img.url, initialUrl: img.url })));
            setGalleryImages(updatedSettingsData.gallery.map((img: any) => ({ file: null, preview: img.url, initialUrl: img.url, fileId: img.fileId })));

        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao salvar.");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSuccess(null), 5000);
        }
    };
    
    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-blue" /></div>;
    
    if (error && !settings) {
       return (
         <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
          <div className="flex">
            <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-4"/></div>
            <div>
              <p className="text-xl font-bold text-red-800">Erro ao Carregar</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
       );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-4xl font-bold text-brand-gray-900">Configurações do Site</h1>
                <button type="submit" disabled={isSubmitting || loading || !settings} className="bg-brand-blue text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200">
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : 'Salvar Alterações'}
                </button>
            </div>
            
            {success && <div className="bg-green-100 border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2"><CheckCircle className="w-5 h-5" />{success}</div>}
            {error && !success && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />{error}</div>}

            <div className="space-y-12">
                 <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-brand-gray-900 mb-6">Identidade Visual</h2>
                    <div className="space-y-4">
                       <ImageUploadField label="Logo do Site" hint="Usado no cabeçalho e rodapé. Use um formato horizontal (PNG recomendado)." imageState={logoImage} onImageChange={handleLogoImageChange} />
                    </div>
                </div>
                
                 <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-brand-gray-900 mb-6">Pop-up Promocional</h2>
                    <div className="space-y-6">
                        <div className="flex items-center">
                           <input type="checkbox" id="promoPopup.enabled" name="promoPopup.enabled" checked={settings?.promoPopup?.enabled || false} onChange={handleFormChange} className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded" />
                           <label htmlFor="promoPopup.enabled" className="ml-2 block text-sm font-medium text-gray-900">Ativar pop-up promocional na entrada do site</label>
                        </div>
                        <ImageUploadField label="Imagem do Pop-up" hint="Recomendação: 800x600 pixels." imageState={promoPopupImage} onImageChange={handlePromoPopupImageChange} />
                         <div>
                            <label htmlFor="promoPopup.title" className="block text-sm font-medium text-gray-700">Título</label>
                            <input type="text" id="promoPopup.title" name="promoPopup.title" value={settings?.promoPopup?.title || ''} onChange={handleFormChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                         <div>
                            <label htmlFor="promoPopup.description" className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea id="promoPopup.description" name="promoPopup.description" value={settings?.promoPopup?.description || ''} onChange={handleFormChange} rows={2} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label htmlFor="promoPopup.buttonText" className="block text-sm font-medium text-gray-700">Texto do Botão</label>
                                <input type="text" id="promoPopup.buttonText" name="promoPopup.buttonText" value={settings?.promoPopup?.buttonText || ''} onChange={handleFormChange} placeholder="Ex: Ver Ofertas" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                             <div>
                                <label htmlFor="promoPopup.buttonLink" className="block text-sm font-medium text-gray-700">Link do Botão</label>
                                <input type="url" id="promoPopup.buttonLink" name="promoPopup.buttonLink" value={settings?.promoPopup?.buttonLink || ''} onChange={handleFormChange} placeholder="Ex: /catalog" className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                         </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-brand-gray-900 mb-6">Seção Principal (Hero)</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="hero.title" className="block text-sm font-medium text-gray-700">Título</label>
                            <input type="text" id="hero.title" name="hero.title" value={settings?.hero.title || ''} onChange={handleFormChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                        <div>
                            <label htmlFor="hero.description" className="block text-sm font-medium text-gray-700">Descrição</label>
                            <textarea id="hero.description" name="hero.description" value={settings?.hero.description || ''} onChange={handleFormChange} rows={3} className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-blue focus:border-brand-blue" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Imagens do Carrossel (Hero)</label>
                            <div className="space-y-4">
                                {heroImages.map((img, index) => (
                                    <div key={img.id || index} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50/50">
                                        <div className="flex-grow">
                                            <ImageUploadField 
                                                label={`Imagem ${index + 1}`} 
                                                imageState={img} 
                                                onImageChange={(file) => handleHeroImageChange(index, file)} 
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeHeroImage(index)} 
                                            className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50 mt-6"
                                            aria-label={`Remover Imagem ${index + 1}`}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {heroImages.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma imagem no carrossel. Adicione uma para começar.</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={addHeroImageSlot}
                                className="mt-4 flex items-center gap-2 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Adicionar Imagem ao Carrossel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-brand-gray-900 mb-6">Galeria de Imagens da Página Inicial</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {galleryImages.map((img, index) => (
                           <ImageUploadField key={index} label={`Imagem da Galeria ${index + 1}`} imageState={img} onImageChange={(file) => handleGalleryImageChange(index, file)} />
                        ))}
                    </div>
                </div>
            </div>
        </form>
    );
}