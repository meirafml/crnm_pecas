'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, Calendar, X } from 'lucide-react';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  
  // Advanced Filters
  const [vendedorFiltro, setVendedorFiltro] = useState('');
  const [ordemFiltro, setOrdemFiltro] = useState(''); // 'maior' | 'menor' | ''
  const [statusFiltro, setStatusFiltro] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        const res = await fetch('/api/dados?tabela=crm_orcamentos');
        const json = await res.json();
        setOrcamentos(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    carregar();
  }, []);

  let filtrados = orcamentos.filter(o => {
    const term = busca.toLowerCase();
    const passaBusca = (o.CLIENTE_ORC || '').toLowerCase().includes(term) || 
                       (o.ORC_NUMERO_ORCAMENTO || '').toLowerCase().includes(term) || 
                       (o.CODIGO_PRODUTO_ORC || '').toLowerCase().includes(term);
    const passaVendedor = vendedorFiltro ? o.ORC_NOME_VENDEDOR === vendedorFiltro : true;
    const statusObj = o.STATUS_ORCAMENTO || o.STATUS || 'Aberto';
    const passaStatus = statusFiltro ? (statusObj.toLowerCase() === statusFiltro.toLowerCase()) : true;
    
    return passaBusca && passaVendedor && passaStatus;
  });

  if (sortConfig) {
    filtrados.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';
      if (sortConfig.key === 'ORC_DATA_EMISSAO_ORCAMENTO') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  } else if (ordemFiltro === 'maior') {
    filtrados.sort((a, b) => (b.ORC_VALOR_TOTAL || 0) - (a.ORC_VALOR_TOTAL || 0));
  } else if (ordemFiltro === 'menor') {
    filtrados.sort((a, b) => (a.ORC_VALOR_TOTAL || 0) - (b.ORC_VALOR_TOTAL || 0));
  }

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current && current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const vendedores = Array.from(new Set(orcamentos.map(o => o.ORC_NOME_VENDEDOR).filter(Boolean))).sort();

  return (
    <div className="flex-1 p-8 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Orçamentos em Aberto</h1>
            <p className="text-gray-400">Acompanhamento e negociação de propostas comerciais.</p>
          </div>
        </div>

        {/* Barra de Filtros Avançados */}
        <div className="glass-panel p-4 flex flex-wrap gap-4 items-center border border-white/5 bg-black/20">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar Cliente, Produto ou Nº Orçamento..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>

          <select 
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-sky-500/50 transition-colors"
            value={vendedorFiltro} onChange={e => setVendedorFiltro(e.target.value)}
          >
            <option value="">Qualquer Vendedor</option>
            {vendedores.map(v => <option key={v as string} value={v as string}>{v as string}</option>)}
          </select>

          <select 
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-sky-500/50 transition-colors"
            value={ordemFiltro} onChange={e => setOrdemFiltro(e.target.value)}
          >
            <option value="">Ordenação Original</option>
            <option value="maior">Maior Valor R$ (Decrescente)</option>
            <option value="menor">Menor Valor R$ (Crescente)</option>
          </select>
          
          <select 
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-sky-500/50 transition-colors"
            value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="Aberto">Aberto</option>
            <option value="Ganho">Ganho</option>
            <option value="Perdido">Perdido</option>
          </select>
          
          {(busca || vendedorFiltro || ordemFiltro || statusFiltro) && (
            <button 
              onClick={() => { setBusca(''); setVendedorFiltro(''); setOrdemFiltro(''); setStatusFiltro(''); setSortConfig(null); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X size={14} /> Limpar
            </button>
          )}
        </div>
        </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-emerald-400 animate-spin" />
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-white/[0.03] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('CLIENTE_ORC')}>Cliente / Vendedor ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('CODIGO_PRODUTO_ORC')}>Produto ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('ORC_DATA_EMISSAO_ORCAMENTO')}>Datas ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 text-right cursor-pointer hover:bg-white/5" onClick={() => handleSort('ORC_VALOR_TOTAL')}>Valores ↕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtrados.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{o.CLIENTE_ORC || '—'}</div>
                      <div className="text-xs text-gray-400 mt-1 uppercase flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400/50 inline-block"></span>
                        {o.ORC_NOME_VENDEDOR}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sky-300 font-mono text-xs">{o.CODIGO_PRODUTO_ORC}</div>
                      <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Número: {o.ORC_NUMERO_ORCAMENTO}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-gray-400 text-xs">
                        <span className="flex items-center gap-1" title="Emissão"><Calendar size={12}/> {o.ORC_DATA_EMISSAO_ORCAMENTO || '—'}</span>
                        <span className="text-[10px] text-gray-500" title="Validade">Até {o.ORC_DATA_ORCAMENTO === '2030-12-31' ? 'Indefinido' : o.ORC_DATA_ORCAMENTO}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {o.ORC_VALOR_TOTAL !== null ? (
                        <>
                          <div className="font-bold text-emerald-300 text-base">
                            R$ {o.ORC_VALOR_TOTAL.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase mt-0.5">
                            Unitário: R$ {(o.ORC_VALOR_UNITARIO || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Nenhum orçamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
