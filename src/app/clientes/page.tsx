'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, MapPin, Search, Tag, X } from 'lucide-react';
import Cliente360Modal from '@/components/Cliente360Modal';

import { useData } from '@/contexts/DataContext';

export default function ClientesPage() {
  const { clientes, loading } = useData();
  const [busca, setBusca] = useState('');

  // Advanced Filters
  const [statusFiltro, setStatusFiltro] = useState('');
  const [ufFiltro, setUfFiltro] = useState('');
  const [diasFiltro, setDiasFiltro] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const [cliente360, setCliente360] = useState<{ codigo: string, loja: string } | null>(null);

  const isBuscandoCurto = busca.length > 0 && busca.length < 4;

  const filtrados = useMemo(() => {
    if (!clientes) return [];
    if (isBuscandoCurto) return []; // Retorna vazio enquanto digita a string curta

    // Performance: calcula o .toLowerCase() uma vez só
    const term = busca.toLowerCase();

    return clientes.filter(c => {
      // Evita erro se c.CODIGO_CLIENTE vier como numérico do banco
      const strNome = c.NOME_CLIENTE ? String(c.NOME_CLIENTE).toLowerCase() : '';
      const strCod = c.CODIGO_CLIENTE ? String(c.CODIGO_CLIENTE).toLowerCase() : '';

      const passaBusca = term ? (strNome.includes(term) || strCod.includes(term)) : true;
      const passaStatus = statusFiltro ? c.STATUS_BASE === statusFiltro : true;
      const passaUf = ufFiltro ? c.UF === ufFiltro : true;

      let passaDias = true;
      if (diasFiltro === '30') passaDias = c.DIAS_SEM_COMPRA && c.DIAS_SEM_COMPRA > 30;
      if (diasFiltro === '90') passaDias = c.DIAS_SEM_COMPRA && c.DIAS_SEM_COMPRA > 90;
      if (diasFiltro === '120') passaDias = c.DIAS_SEM_COMPRA && c.DIAS_SEM_COMPRA > 120;

      return passaBusca && passaStatus && passaUf && passaDias;
    });
  }, [clientes, busca, statusFiltro, ufFiltro, diasFiltro, isBuscandoCurto]);

  const filtradosOrdenados = useMemo(() => {
    let result = [...filtrados];
    if (sortConfig) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [filtrados, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current && current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const ufs = Array.from(new Set(clientes.map(c => c.UF).filter(Boolean))).sort();

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-2">Base de Clientes</h1>
            <p className="text-gray-400">Gerencie e minere informações brutas da sua carteira de clientes.</p>
          </div>
        </div>

        {/* Barra de Filtros Avançados */}
        <div className="glass-panel p-4 flex flex-wrap gap-4 items-center border border-white/5 bg-black/20">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por Nome ou Código..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>

          <select
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-sky-500/50 transition-colors"
            value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="ATIVO">Apenas ATIVO</option>
            <option value="BLOQUEADO">Apenas BLOQUEADO</option>
            <option value="INATIVO">Apenas INATIVO</option>
          </select>

          <select
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-sky-500/50 transition-colors"
            value={ufFiltro} onChange={e => setUfFiltro(e.target.value)}
          >
            <option value="">Todos os Estados</option>
            {ufs.map(uf => <option key={uf as string} value={uf as string}>{uf as string}</option>)}
          </select>

          <select
            className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300 focus:border-sky-500/50 transition-colors"
            value={diasFiltro} onChange={e => setDiasFiltro(e.target.value)}
          >
            <option value="">Qualquer tempo de Inatividade</option>
            <option value="30">Mais de 30 dias inativo</option>
            <option value="90">Risco (&gt; 90 dias)</option>
            <option value="120">Evasão (&gt; 120 dias)</option>
          </select>

          {(busca || statusFiltro || ufFiltro || diasFiltro || sortConfig) && (
            <button
              onClick={() => { setBusca(''); setStatusFiltro(''); setUfFiltro(''); setDiasFiltro(''); setSortConfig(null); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <X size={14} /> Limpar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="text-sky-400 animate-spin" />
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-white/[0.03] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('NOME_CLIENTE')}>Cliente ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('CIDADE')}>Localização ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('TELEFONE')}>Contato ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('DIAS_SEM_COMPRA')}>Dias sem Comprar ↕</th>
                  <th className="px-6 py-4 font-semibold border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => handleSort('STATUS_BASE')}>Status ↕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isBuscandoCurto && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sky-400 font-mono text-sm blink">
                      Digite pelo menos 4 caracteres para iniciar a busca...
                    </td>
                  </tr>
                )}
                {!isBuscandoCurto && filtradosOrdenados.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setCliente360({ codigo: c.CODIGO_CLIENTE, loja: c.LOJA_CLIENTE })}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white group-hover:text-emerald-300 transition-colors">{c.NOME_CLIENTE || 'N/A'}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">ID: {c.CODIGO_CLIENTE} Lj: {c.LOJA_CLIENTE}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <MapPin size={14} className="text-gray-500" />
                        {c.CIDADE}-{c.UF}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">{c.TELEFONE || c.CELULAR_WHATSAPP_CONTATO || '—'}</div>
                      <div className="text-xs text-gray-500 max-w-[200px] truncate" title={c.EMAIL}>{c.EMAIL}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.DIAS_SEM_COMPRA !== null ? (
                        <div className={`font-semibold ${c.DIAS_SEM_COMPRA > 90 ? 'text-red-400' : c.DIAS_SEM_COMPRA > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {c.DIAS_SEM_COMPRA} dias
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">Sem Histórico</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${c.STATUS_BASE === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {c.STATUS_BASE}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isBuscandoCurto && filtradosOrdenados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
