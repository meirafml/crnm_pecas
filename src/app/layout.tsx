import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Bouwman - CRM Peças',
  description: 'CRM Preditivo de Peças e Máquinas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans bg-slate-950 text-slate-100">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 ml-64 h-full overflow-y-auto px-8 py-6 relative">
            <div className="max-w-7xl mx-auto z-10 relative">
              {children}
            </div>
            {/* Efeitos Decorativos de fundo no conteúdo principal */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          </main>
        </div>
      </body>
    </html>
  );
}
