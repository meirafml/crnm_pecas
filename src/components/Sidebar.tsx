'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Tractor, FileText, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen border-r border-[#ffffff15] bg-[#00000030] backdrop-blur-xl flex flex-col p-4 fixed left-0 top-0">
      <div className="flex flex-col items-center gap-3 mb-10 mt-6 px-2">
        {/*
          A imagem fornecida possui as letras em branco nativamente, combinando perfeitamente com o fundo escuro do dashboard.
          Certifique-se de salvar o novo anexo branco como "logo-bouwman.png" dentro da pasta "public".
        */}
        <img src="/logo-bouwman.png" alt="Bouwman Service" className="w-48" />
        <div className="text-center mt-2 border-t border-white/10 w-full pt-3">
          <h1 className="font-bold text-sm tracking-widest text-sky-400 uppercase">CRM <span className="opacity-70 font-light text-white">Peças</span></h1>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Visão Geral" active={pathname === '/'} />
        
        <div className="pt-2 pb-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Comercial</p>
          <NavItem href="/orcamentos" icon={<FileText size={18} />} label="Tabela de Orçamentos" active={pathname === '/orcamentos'} />
          <NavItem href="/orcamentos/pipeline" icon={<LayoutDashboard size={18} />} label="Pipeline Comercial" active={pathname === '/orcamentos/pipeline'} />
          <NavItem href="/maquinas" icon={<Tractor size={18} />} label="Parque de Máquinas" active={pathname === '/maquinas'} />
        </div>

        <div className="pt-2 pb-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Sucesso do Cliente</p>
          <NavItem href="/clientes" icon={<Users size={18} />} label="Tabela de Clientes" active={pathname === '/clientes'} />
          <NavItem href="/clientes/carteira" icon={<LayoutDashboard size={18} />} label="CS Pipeline (Retenção)" active={pathname === '/clientes/carteira'} />
        </div>
      </nav>

      <div className="mt-auto border-t border-[#ffffff15] pt-4 space-y-2">
        <NavItem href="#" icon={<Settings size={18} />} label="Configurações" />
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left">
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
