'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, AlertTriangle, Flame, Skull, MapPin } from 'lucide-react';
import Link from 'next/link';
import Cliente360Modal from '@/components/Cliente360Modal';

import { useData } from '@/contexts/DataContext';

export default function PipelineCarteira() {
  const { clientes, loading } = useData();
  const [cliente360, setCliente360] = useState<{codigo: string, loja: string} | null>(null);

  // Lógica de Categorização Automática (Prevenção de Evasão)
  const colunas = {
    saudavel: { titulo: 'Base Saudável (30d)', cor: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icone: <ShieldCheck size={16} />, items: [] as any[] },
    atencao: { titulo: 'Alerta (31-60d)', cor: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', icone: <AlertTriangle size={16} />, items: [] as any[] },
    risco: { titulo: 'Risco Alto (61-90d)', cor: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10', icone: <Flame size={16} />, items: [] as any[] },
    churn: { titulo: 'Evasão Confirmada (>90d)', cor: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', icone: <Skull size={16} />, items: [] as any[] },
  };

  clientes.filter(c => c.STATUS_BASE === 'ATIVO').forEach(c => {
    const dias = c.DIAS_SEM_COMPRA || 0;
    
    if (dias <= 30) {
      colunas.saudavel.items.push(c);
    } else if (dias <= 60) {
      colunas.atencao.items.push(c);
    } else if (dias <= 90) {
      colunas.risco.items.push(c);
    } else {
      colunas.churn.items.push(c);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={48} className="text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Carteira / CS Pipeline</h1>
          <p className="text-gray-400">Cards mudam de coluna automaticamente conforme os dias passam. Evite a evasão antes que aconteça.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/clientes" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors">
            Ver Carteira em Tabela
          </Link>
        </div>
      </header>

      {/* KANBAN BOARD */}
      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 h-[calc(100vh-200px)] pr-8 after:content-[''] after:w-4 after:shrink-0">
        {Object.entries(colunas).map(([chave, coluna]) => (
          <div key={chave} className="flex-none w-[340px] flex flex-col h-full bg-[#ffffff02] rounded-xl border border-white/5">
            {/* Header da Coluna */}
            <div className={`p-4 border-b ${coluna.border} ${coluna.bg} rounded-t-xl shrink-0`}>
              <div className={`flex items-center justify-between font-bold ${coluna.cor} uppercase tracking-wider text-sm`}>
                <div className="flex items-center gap-2">{coluna.icone} {coluna.titulo}</div>
                <span className="text-xs font-black bg-black/40 px-2 py-1 rounded-md text-white">{coluna.items.length} CLIENTES</span>
              </div>
            </div>

            {/* Cards da Coluna */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {coluna.items.sort((a,b) => (b.DIAS_SEM_COMPRA || 0) - (a.DIAS_SEM_COMPRA || 0)).map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setCliente360({codigo: c.CODIGO_CLIENTE, loja: c.LOJA_CLIENTE})}
                  className="glass-panel p-4 cursor-pointer hover:border-white/20 transition-all hover:-translate-y-1 group relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${coluna.bg.replace('10', '50')} opacity-50`} />
                  
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-[10px] font-bold bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase flex gap-1 items-center">
                      Lj: {c.LOJA_CLIENTE}
                    </span>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-sm shadow-sm ${coluna.bg} ${coluna.cor}`}>
                      {c.DIAS_SEM_COMPRA || 0} DIAS
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-100 text-sm leading-tight mb-2 group-hover:text-white pl-2">
                    {c.NOME_CLIENTE || 'N/A'}
                  </h4>
                  
                  <div className="pl-2 flex flex-col gap-1 text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1"><MapPin size={12}/> {c.CIDADE}-{c.UF}</div>
                  </div>
                  
                  <div className="pl-2 pt-3 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[10px] uppercase text-gray-500 font-medium">
                      Vendedor: <span className="text-gray-300">{c.NOME_VENDEDOR_RESP || 'Indefinido'}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {coluna.items.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg text-sm text-gray-600 font-medium italic">
                  Nenhum cliente
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Estilo para a scrollbar customizada do Kanban */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />

      {/* MODAL 360 GRAUS */}
      {cliente360 && (
        <Cliente360Modal 
          codigoCliente={cliente360.codigo} 
          lojaCliente={cliente360.loja} 
          onClose={() => setCliente360(null)} 
        />
      )}
    </div>
  );
}
