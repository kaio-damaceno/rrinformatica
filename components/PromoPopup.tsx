'use client';

import React, { useState, useEffect } from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

const PROMO_POPUP_SESSION_KEY = 'impres_promo_popup_shown';

const PromoPopup = () => {
    const { settings } = useSiteData();
    const [isOpen, setIsOpen] = useState(false);

    const promoData = settings?.promoPopup;

    useEffect(() => {
        if (!promoData || !promoData.enabled) {
            return;
        }

        const hasBeenShown = sessionStorage.getItem(PROMO_POPUP_SESSION_KEY);

        if (!hasBeenShown) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem(PROMO_POPUP_SESSION_KEY, 'true');
            }, 1500); // 1.5 second delay

            return () => clearTimeout(timer);
        }
    }, [promoData]);

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen || !promoData || !promoData.enabled || !promoData.image?.url) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-fade-in"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
        >
            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden animate-scale-in-center"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 z-10 p-2 text-gray-500 bg-white/70 rounded-full hover:bg-white hover:text-black transition-colors"
                    aria-label="Fechar pop-up promocional"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="relative w-full h-48 md:h-64">
                     <Image
                        src={promoData.image.url}
                        alt={promoData.title || 'Promoção'}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                
                <div className="p-6 md:p-8 text-center">
                    {promoData.title && (
                         <h2 id="promo-popup-title" className="text-2xl md:text-3xl font-bold text-brand-gray-900 mb-2">
                            {promoData.title}
                         </h2>
                    )}
                    {promoData.description && (
                        <p className="text-gray-600 mb-6">{promoData.description}</p>
                    )}
                    {promoData.buttonText && promoData.buttonLink && (
                         <Link
                            href={promoData.buttonLink}
                            onClick={handleClose}
                            className="inline-block w-full max-w-xs bg-brand-red text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-brand-red-dark transition-all duration-300 transform hover:scale-105"
                        >
                            {promoData.buttonText}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromoPopup;