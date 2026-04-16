'use client';

import { useEffect, useState } from 'react';
import { Loader2, Flame, Clock, Snowflake, AlertOctagon, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { useData } from '@/contexts/DataContext';

export default function PipelineOrcamentos() {
  const { orcamentos, loading } = useData();

  // Lógica de Categorização Automática
  const hoje = new Date();
  
  const colunas = {
    quentes: { titulo: 'Quentes (0-7 Dias)', cor: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icone: <Flame size={16} />, items: [] as any[], total: 0 },
    negociacao: { titulo: 'Em Negociação (8-15 Dias)', cor: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10', icone: <TrendingUp size={16} />, items: [] as any[], total: 0 },
    esfriando: { titulo: 'Esfriando (16-30 Dias)', cor: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', icone: <Clock size={16} />, items: [] as any[], total: 0 },
    congelados: { titulo: 'Congelados (>30 Dias)', cor: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', icone: <Snowflake size={16} />, items: [] as any[], total: 0 },
  };

  orcamentos.forEach(o => {
    if (!o.ORC_DATA_EMISSAO_ORCAMENTO) return;
    
    const dataEmissao = new Date(o.ORC_DATA_EMISSAO_ORCAMENTO);
    const diasAberto = Math.floor((hoje.getTime() - dataEmissao.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasAberto <= 7) {
      colunas.quentes.items.push({...o, diasAberto});
      colunas.quentes.total += (o.ORC_VALOR_TOTAL || 0);
    } else if (diasAberto <= 15) {
      colunas.negociacao.items.push({...o, diasAberto});
      colunas.negociacao.total += (o.ORC_VALOR_TOTAL || 0);
    } else if (diasAberto <= 30) {
      colunas.esfriando.items.push({...o, diasAberto});
      colunas.esfriando.total += (o.ORC_VALOR_TOTAL || 0);
    } else {
      colunas.congelados.items.push({...o, diasAberto});
      colunas.congelados.total += (o.ORC_VALOR_TOTAL || 0);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={48} className="text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Pipeline de Orçamentos</h1>
          <p className="text-gray-400">Visão preditiva baseada no tempo de abertura. Foco no preenchimento do funil.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/orcamentos" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors">
            Ver em Tabela
          </Link>
        </div>
      </header>

      {/* KANBAN BOARD */}
      <div className="flex gap-6 overflow-x-auto pb-4 pt-1 flex-1 min-h-[400px] pr-8 after:content-[''] after:w-4 after:shrink-0">
        {Object.entries(colunas).map(([chave, coluna]) => (
          <div key={chave} className="flex-none w-80 flex flex-col h-full bg-[#ffffff02] rounded-xl border border-white/5">
            {/* Header da Coluna */}
            <div className={`p-4 border-b ${coluna.border} ${coluna.bg} rounded-t-xl shrink-0`}>
              <div className={`flex items-center gap-2 font-bold ${coluna.cor} mb-1 uppercase tracking-wider text-sm`}>
                {coluna.icone} {coluna.titulo}
              </div>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-white">R$ {coluna.total.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                <span className="text-xs text-gray-400 font-medium bg-black/40 px-2 py-0.5 rounded-full">{coluna.items.length} itens</span>
              </div>
            </div>

            {/* Cards da Coluna */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {coluna.items.sort((a,b) => b.ORC_VALOR_TOTAL - a.ORC_VALOR_TOTAL).map((o, i) => (
                <div key={i} className="glass-panel p-4 cursor-pointer hover:border-white/20 transition-all hover:-translate-y-1 group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-white/10 text-gray-300 px-2 py-0.5 rounded uppercase">{o.ORC_NUMERO_ORCAMENTO}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${coluna.bg} ${coluna.cor}`}>
                      {o.diasAberto}d
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-100 text-sm leading-tight mb-1 group-hover:text-white line-clamp-2" title={o.CLIENTE_ORC}>
                    {o.CLIENTE_ORC || 'Cliente Não Identificado'}
                  </h4>
                  <div className="font-mono text-xs text-amber-400/80 mb-3 truncate" title={o.CODIGO_PRODUTO_ORC}>
                    {o.CODIGO_PRODUTO_ORC}
                  </div>
                  
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[10px] uppercase text-gray-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block"></span>
                      {o.ORC_NOME_VENDEDOR?.split(' ')[0] || 'Vendedor'}
                    </div>
                    <div className="font-bold text-emerald-300 text-sm">
                      R$ {o.ORC_VALOR_TOTAL.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              ))}
              
              {coluna.items.length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-lg text-sm text-gray-600 font-medium italic">
                  Nenhum orçamento
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
    </div>
  );
}
