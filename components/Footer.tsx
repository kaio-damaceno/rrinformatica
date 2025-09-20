
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Printer, Facebook, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  logoUrl?: string | null;
}

const Footer: React.FC<FooterProps> = ({ logoUrl }) => {
  return (
    <footer id="contact" className="bg-brand-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
             <Link href="/" className="flex items-center space-x-3 mb-4">
                {logoUrl ? (
                  // Clever trick to make any logo white for the dark footer
                  <Image src={logoUrl} alt="Logo Impres" width={120} height={30} style={{ filter: 'brightness(0) invert(1)', height: 'auto' }} />
                ) : (
                  <>
                    <Printer className="w-8 h-8 text-brand-blue-light" />
                    <span className="text-2xl font-bold">Impres</span>
                  </>
                )}
              </Link>
            <p className="text-gray-400">Sua solução completa em impressão e suprimentos.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/catalog" className="text-gray-400 hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link href="/#services" className="text-gray-400 hover:text-white transition-colors">Serviços</Link></li>
              <li><Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: contato@impres.com</li>
              <li>Telefone: (11) 1234-5678</li>
              <li>Endereço: Rua Fictícia, 123, São Paulo - SP</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Impres. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;