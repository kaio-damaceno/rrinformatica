'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Tag, LogOut, BarChart2, Printer, Wrench, MessageSquare, Settings } from 'lucide-react';
import { auth } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/categories', label: 'Categorias', icon: Tag },
  { href: '/admin/services', label: 'Serviços', icon: Wrench },
  { href: '/admin/testimonials', label: 'Depoimentos', icon: MessageSquare },
  { href: '/admin/reports', label: 'Relatórios', icon: BarChart2 },
  { href: '/admin/settings', label: 'Config. do Site', icon: Settings },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) {
        console.error("Firebase auth not available");
        return;
    }
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error("Erro ao fazer logout: ", error);
    }
  };

  return (
    <aside className="w-64 bg-brand-gray-900 text-white flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-3">
                <Printer className="w-8 h-8 text-brand-blue-light" />
                <span className="text-2xl font-bold">Impres Admin</span>
            </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                            ? 'bg-brand-blue text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                    </Link>
                );
            })}
        </nav>
        <div className="px-4 py-6 mt-auto border-t border-gray-700">
            <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
            </button>
        </div>
    </aside>
  );
};

export default AdminSidebar;