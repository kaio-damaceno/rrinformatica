'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Tag, BarChart2, ArrowRight, Wrench, MessageSquare, Settings } from 'lucide-react';

const AdminDashboardPage = () => {
  const adminSections = [
    {
      title: 'Gerenciar Produtos',
      description: 'Adicione, edite e remova produtos do seu catálogo.',
      href: '/admin/products',
      icon: <Package className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: 'Gerenciar Categorias',
      description: 'Organize seus produtos em diferentes categorias.',
      href: '/admin/categories',
      icon: <Tag className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: 'Gerenciar Serviços',
      description: 'Edite os serviços oferecidos exibidos na página inicial.',
      href: '/admin/services',
      icon: <Wrench className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: 'Gerenciar Depoimentos',
      description: 'Adicione e remova depoimentos de clientes.',
      href: '/admin/testimonials',
      icon: <MessageSquare className="w-8 h-8 text-brand-blue" />,
    },
    {
      title: 'Relatórios',
      description: 'Visualize dados de vendas e performance da loja.',
      href: '/admin/reports',
      icon: <BarChart2 className="w-8 h-8 text-brand-blue" />,
    },
     {
      title: 'Configurações do Site',
      description: 'Altere textos e imagens da página inicial.',
      href: '/admin/settings',
      icon: <Settings className="w-8 h-8 text-brand-blue" />,
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-brand-gray-900">Painel do Administrador</h1>
        <p className="text-lg text-gray-600 mt-2">Bem-vindo! Gerencie sua loja de forma eficiente a partir daqui.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {adminSections.map((section) => (
          <Link href={section.href} key={section.title}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  {section.icon}
                </div>
              </div>
              <h2 className="text-xl font-bold text-brand-gray-900 mb-2">{section.title}</h2>
              <p className="text-gray-600 flex-grow">{section.description}</p>
              <div className="mt-6 flex justify-end items-center">
                <span className="font-semibold text-brand-blue group-hover:underline">Acessar</span>
                <ArrowRight className="w-5 h-5 ml-2 text-brand-blue transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;