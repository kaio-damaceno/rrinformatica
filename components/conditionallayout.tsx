'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useSiteData } from '@/contexts/SiteDataContext';

const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  const { settings, categories, products, loading } = useSiteData();
  const logoUrl = settings?.logo?.url || null;

  return (
    <>
      {!isAdminRoute && <Header logoUrl={logoUrl} loading={loading} categories={categories} products={products} />}
      <main>{children}</main>
      {!isAdminRoute && <Footer logoUrl={logoUrl} />}
    </>
  );
};

export default ConditionalLayout;