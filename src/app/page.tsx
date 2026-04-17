'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, Clock, MapPin, ReceiptText, Tractor, TrendingUp, Users, MessageCircle, X, Loader2, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import Link from 'next/link';
import Cliente360Modal from '@/components/Cliente360Modal';

import { useData } from '@/contexts/DataContext';

export default function Dashboard() {
  const { clientes, orcamentos, maquinas, loading, ultimaSync } = useData();
  const [vendedorSelecionado, setVendedorSelecionado] = useState<any>(null);
  const [clienteModal, setClienteModal] = useState<{codigo: string, loja: string} | null>(null);

  // States para Filtros do Cross-Sell
  const [crossFilial, setCrossFilial] = useState('');
  const [crossFabricante, setCrossFabricante] = useState('');
  const [crossModelo, setCrossModelo] = useState('');

  const clientesEmRisco = clientes.filter(c => (c.DIAS_SEM_COMPRA || 0) > 90);
  const totalOrcamentos = orcamentos.reduce((acc, curr) => acc + (curr.ORC_VALOR_TOTAL || 0), 0);
  const totalAtivos = clientes.filter(c => c.STATUS_BASE === 'ATIVO').length;

  // Agrupar Orçamentos por Vendedor
  const rankingVendedores = Object.values(orcamentos.reduce((acc: any, curr) => {
    const vendedor = (curr.ORC_NOME_VENDEDOR || 'NÃO IDENTIFICADO').trim();
    if (!acc[vendedor]) {
      acc[vendedor] = { nome: vendedor, total: 0, quantidade: 0, orcamentos: [] as any[] };
    }
    acc[vendedor].total += (curr.ORC_VALOR_TOTAL || 0);
    acc[vendedor].quantidade += 1;
    acc[vendedor].orcamentos.push(curr);
    return acc;
  }, {} as Record<string, any>))
  .sort((a: any, b: any) => b.total - a.total).slice(0, 8) as any[];

  // Gráfico: Funil Orçamentos (Emissão vs Hoje)
  const funilOrcamentosRaw = [
    { name: 'Recentes (0-7d)', maxD: 7, valor: 0, color: '#34d399' }, 
    { name: 'Mornos (8-15d)', maxD: 15, valor: 0, color: '#fbbf24' },        
    { name: 'Esfriando (16-30d)', maxD: 30, valor: 0, color: '#fb923c' },    
    { name: 'Congelados (>30d)', maxD: 9999, valor: 0, color: '#ef4444' }, 
  ];
  orcamentos.forEach(o => {
    if(!o.ORC_DATA_EMISSAO_ORCAMENTO) return;
    const dias = Math.floor((new Date().getTime() - new Date(o.ORC_DATA_EMISSAO_ORCAMENTO).getTime()) / (1000 * 60 * 60 * 24));
    const bucket = funilOrcamentosRaw.find(b => dias <= b.maxD) || funilOrcamentosRaw[3];
    bucket.valor += (o.ORC_VALOR_TOTAL || 0);
  });
  const funilOrcamentos = funilOrcamentosRaw;

  // Gráfico: Churn Data (Dias inativos vs Qtde Clientes)
  const churnDataRaw = [
    { name: 'Ativos', min: 0, max: 90, quantidade: 0 },
    { name: '90-180d', min: 91, max: 180, quantidade: 0 },
    { name: '6m-1ano', min: 181, max: 365, quantidade: 0 },
    { name: '1-2 anos', min: 366, max: 730, quantidade: 0 },
    { name: '> 2 anos', min: 731, max: 99999, quantidade: 0 },
  ];
  clientes.forEach(c => {
    if(c.DIAS_SEM_COMPRA == null) return;
    const bucket = churnDataRaw.find(b => c.DIAS_SEM_COMPRA >= b.min && c.DIAS_SEM_COMPRA <= b.max) || churnDataRaw[4];
    bucket.quantidade += 1;
  });
  const churnData = churnDataRaw;

  // LÓGICA DE CROSS-SELL (Máquinas Faturadas nos últimos 90 dias)
  const maquinasRecentesTotal = maquinas.map(m => {
    let diasAge = 9999;
    if (m.EMISSAO) {
      // Tenta fazer o parse da data EMISSAO
      const dt = new Date(m.EMISSAO.toString().includes('Date') ? parseInt(m.EMISSAO.match(/\d+/)![0]) : m.EMISSAO);
      if (!isNaN(dt.getTime())) {
        diasAge = Math.floor((new Date().getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    return { ...m, diasAposFaturamento: diasAge };
  }).filter(m => m.diasAposFaturamento <= 90).sort((a,b) => a.diasAposFaturamento - b.diasAposFaturamento);

  // Opções para os combos
  const crossFiliasDisponiveis = Array.from(new Set(maquinasRecentesTotal.map(m => String(m.FILIAL || '')).filter(Boolean)));
  const crossFabricantesDisponiveis = Array.from(new Set(maquinasRecentesTotal.map(m => String(m.FABRICANTE || m.marca || '').trim()).filter(Boolean)));
  const crossModelosDisponiveis = Array.from(new Set(maquinasRecentesTotal.map(m => String(m.MODELO || '').trim()).filter(Boolean)));

  // Aplicar Filtros ao Cross-Sell
  const maquinasRecentesFiltradas = maquinasRecentesTotal.filter(m => {
    if (crossFilial && String(m.FILIAL) !== crossFilial) return false;
    if (crossFabricante && String(m.FABRICANTE || m.marca || '').trim() !== crossFabricante) return false;
    if (crossModelo && String(m.MODELO || '').trim() !== crossModelo) return false;
    return true;
  });

  // Estado vazio
  const semDados = clientes.length === 0 && orcamentos.length === 0 && maquinas.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="text-sky-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Carregando dados do CRM...</p>
        </div>
      </div>
    );
  }

  if (semDados) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center glass-panel p-12 max-w-lg">
          <Database size={64} className="text-sky-400/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Aguardando Sincronização</h2>
          <p className="text-gray-400 mb-6">
            O banco de dados está vazio. A próxima carga automática do ERP Protheus será executada em breve pelo Task Scheduler.
          </p>
          <div className="flex items-center justify-center gap-2 text-sky-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Ouvindo sincronizações em <code className="bg-white/5 px-2 py-0.5 rounded">crm-pecas.vercel.app/api/sync</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Visão Geral</h1>
          <p className="text-gray-400">Aqui está o pulso das suas vendas preditivas hoje.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-sm font-medium text-emerald-100">Dados Reais — Supabase</span>
              {ultimaSync && <p className="text-[10px] text-gray-500">Última sync: {ultimaSync}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* CARDS DE TOPO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard 
          title="Total de Clientes" 
          value={clientes.length.toString()} 
          subtitle={`${totalAtivos} ativos • ${clientes.length - totalAtivos} bloqueados`}
          icon={<Users className="text-sky-400" />}
          accentColor="sky"
        />
        <KpiCard 
          title="Risco de Evasão (Churn)" 
          value={clientesEmRisco.length.toString()} 
          subtitle="Clientes há >90 dias sem compra"
          icon={<AlertCircle className="text-red-400" />}
          accentColor="red"
        />
        <KpiCard 
          title="Oportunidades Cross-Sell" 
          value={maquinasRecentesTotal.length.toString()} 
          subtitle="Equipamentos vendidos < 90 dias"
          icon={<Tractor className="text-amber-400" />}
          accentColor="amber"
          href="/maquinas"
        />
        <KpiCard 
          title="Orçamentos Abertos" 
          value={`R$ ${totalOrcamentos.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
          subtitle={`${orcamentos.length} orçamentos pendentes`}
          icon={<ReceiptText className="text-emerald-400" />}
          accentColor="emerald"
          href="/orcamentos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* LISTA DE CLIENTES EM RISCO */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-sky-400" /> 
              Resgate Imediato — Clientes para Reativar
            </h2>
            <Link href="/clientes" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-2">
            {clientes.filter(c => (c.DIAS_SEM_COMPRA || 0) > 0 && c.STATUS_BASE !== 'BLOQUEADO' && (c.DIAS_SEM_COMPRA || 0) < 365).sort((a,b) => (b.DIAS_SEM_COMPRA || 0) - (a.DIAS_SEM_COMPRA || 0)).slice(0, 12).map((c) => (
              <div key={c.id} onClick={() => setClienteModal({codigo: c.CODIGO_CLIENTE, loja: c.LOJA_CLIENTE})} className="group glass-panel !bg-white/[0.02] hover:!bg-white/[0.05] p-3.5 transition-all flex justify-between items-center cursor-pointer border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${(c.DIAS_SEM_COMPRA || 0) > 90 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : (c.DIAS_SEM_COMPRA || 0) > 30 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {(c.NOME_CLIENTE || '??').substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-100 text-sm group-hover:text-white transition-colors">{c.NOME_CLIENTE}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {c.CIDADE}-{c.UF}
                      {c.STATUS_BASE === 'BLOQUEADO' && <span className="ml-2 text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">BLOQUEADO</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${(c.DIAS_SEM_COMPRA || 0) > 90 ? 'text-red-400' : (c.DIAS_SEM_COMPRA || 0) > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {c.DIAS_SEM_COMPRA || 0} dias
                  </div>
                  <div className="text-[10px] text-gray-500">sem comprar</div>
                </div>
              </div>
            ))}
            {clientes.filter(c => (c.DIAS_SEM_COMPRA || 0) > 0 && c.STATUS_BASE !== 'BLOQUEADO' && (c.DIAS_SEM_COMPRA || 0) < 365).length === 0 && (
              <div className="text-sm text-gray-500 text-center py-6">Nenhum cliente em risco iminente encontrado.</div>
            )}
          </div>
        </div>

        {/* LISTA DE OPORTUNIDADES CROSS-SELL RECENTES */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col border border-amber-500/20 bg-amber-950/10 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Tractor size={18} className="text-amber-400" /> 
                <span className="text-amber-500">Leads Quentes</span> — Entregas Recentes
              </h2>
              <Link href="/maquinas" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
                Trabalhar Leads <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="flex gap-2">
               <select className="bg-black/30 border border-amber-500/20 text-xs rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:border-amber-500" value={crossFilial} onChange={e => setCrossFilial(e.target.value)}>
                 <option value="">Filial Inicial (Todas)</option>
                 {crossFiliasDisponiveis.map((f:any) => <option key={f} value={f}>Filial {f}</option>)}
               </select>
               <select className="bg-black/30 border border-amber-500/20 text-xs rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:border-amber-500" value={crossFabricante} onChange={e => setCrossFabricante(e.target.value)}>
                 <option value="">Fabricante (Todos)</option>
                 {crossFabricantesDisponiveis.map((f:any) => <option key={f} value={f}>{f}</option>)}
               </select>
               <select className="bg-black/30 border border-amber-500/20 text-xs rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:border-amber-500" value={crossModelo} onChange={e => setCrossModelo(e.target.value)}>
                 <option value="">Modelo (Todos)</option>
                 {crossModelosDisponiveis.map((m:any) => <option key={m} value={m}>{m}</option>)}
               </select>
               {(crossFilial || crossFabricante || crossModelo) && (
                  <button onClick={() => {setCrossFilial(''); setCrossFabricante(''); setCrossModelo('');}} className="text-red-400 text-xs hover:text-red-300 flex items-center gap-1 px-2">
                    <X size={12}/> Limpar Filtro
                  </button>
               )}
            </div>
          </div>
          
          <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
            {maquinasRecentesFiltradas.slice(0, 20).map((m) => (
              <div key={m.id} onClick={() => setClienteModal({codigo: m.COD_CLIENTE || m.CODIGO_CLIENTE, loja: m.LOJA_CLIENTE})} className="group glass-panel !bg-amber-500/[0.02] hover:!bg-amber-500/[0.08] p-3.5 transition-all flex justify-between items-center cursor-pointer border border-transparent hover:border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Tractor size={16} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-100 text-sm group-hover:text-white transition-colors">{m.NOME_CLIENTE || 'N/A'}</h3>
                    <p className="text-xs text-gray-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <strong className="text-amber-200/80">{m.MODELO || 'N/A'}</strong>
                      <span>NF: {m.NOTA_FISCAL || '—'}</span>
                      <span className="opacity-50">| Vendedor Máq: {m.NOME_VENDEDOR || 'N/A'}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">
                    Faturado há {m.diasAposFaturamento} d
                  </div>
                  <div className="text-[10px] text-gray-500">{m.EMISSAO}</div>
                </div>
              </div>
            ))}
            {maquinasRecentesFiltradas.length === 0 && (
               <div className="text-sm text-gray-500 text-center py-8 bg-black/20 rounded-lg">
                 Nenhuma entrega recente nos últimos 90 dias com os filtros selecionados.
               </div>
            )}
          </div>
        </div>

        {/* RANKING COMERCIAL */}
        <div className="glass-panel p-6 flex flex-col lg:row-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users size={18} className="text-amber-400" />
              Ranking de Vendedores
            </h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {rankingVendedores.map((vend: any, i: number) => (
              <div 
                key={i} 
                onClick={() => setVendedorSelecionado(vend)}
                className="border-l-2 border-amber-400/50 pl-4 py-2.5 relative group hover:bg-white/[0.02] transition-colors -ml-4 pl-8 rounded-r-lg cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400/60 w-5">#{i+1}</span>
                    <div className="text-sm font-semibold text-gray-200 uppercase truncate max-w-[140px]" title={vend.nome}>{vend.nome}</div>
                  </div>
                  <div className="text-sm font-bold text-white">
                    R$ {vend.total.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                  </div>
                </div>
                <div className="text-xs text-amber-300/70 mt-1 ml-7">
                  {vend.quantidade} orçamento(s) aberto(s)
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/orcamentos" className="w-full mt-6 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            Ver Todos os Orçamentos <ChevronRight size={14} />
          </Link>
        </div>

        {/* GRÁFICOS VISUAIS (Recharts) */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          {/* Gráfico 1: Funil de Orçamentos */}
          <div className="glass-panel p-6">
             <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <ReceiptText size={18} className="text-emerald-400" />
                Funil Preditivo — Orçamentos (Tempo)
             </h2>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={funilOrcamentos} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                   <XAxis type="number" stroke="#4b5563" tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                   <YAxis dataKey="name" type="category" stroke="#9ca3af" width={90} />
                   <Tooltip 
                     cursor={{fill: 'rgba(255,255,255,0.02)'}}
                     contentStyle={{ backgroundColor: '#0b101a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                     formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Volume Retido']}
                   />
                   <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                      {funilOrcamentos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Gráfico 2: Análise de Churn */}
          <div className="glass-panel p-6">
             <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <AlertCircle size={18} className="text-red-400" />
                Análise de Risco — Inatividade (Dias)
             </h2>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={churnData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#4b5563" />
                   <YAxis stroke="#4b5563" />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0b101a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                     formatter={(value: any) => [`${value} Clientes`, 'Volume Escapando']}
                   />
                   <Area type="monotone" dataKey="quantidade" stroke="#ef4444" fillOpacity={1} fill="url(#colorChurn)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

      </div>

      {/* MODAL DE ORÇAMENTOS DO VENDEDOR */}
      {vendedorSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h2 className="text-xl font-bold text-white uppercase">{vendedorSelecionado.nome}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {vendedorSelecionado.quantidade} Orçamentos — Total: <span className="text-amber-400 font-semibold">R$ {vendedorSelecionado.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </p>
              </div>
              <button onClick={() => setVendedorSelecionado(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-white/[0.03] text-gray-400 sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Cliente</th>
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Produto</th>
                    <th className="px-6 py-4 font-semibold border-b border-white/5">Emissão</th>
                    <th className="px-6 py-4 text-right font-semibold border-b border-white/5">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vendedorSelecionado.orcamentos.map((o: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-white">{o.CLIENTE_ORC || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-gray-200 font-mono text-xs">{o.CODIGO_PRODUTO_ORC}</div>
                        <div className="text-gray-500 text-xs mt-0.5">Orç #{o.ORC_NUMERO_ORCAMENTO}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {o.ORC_DATA_EMISSAO_ORCAMENTO ? (
                           o.ORC_DATA_EMISSAO_ORCAMENTO.includes('/Date(') 
                           ? new Date(parseInt(o.ORC_DATA_EMISSAO_ORCAMENTO.match(/\\d+/)?.[0] || '0')).toLocaleDateString('pt-BR') 
                           : new Date(o.ORC_DATA_EMISSAO_ORCAMENTO).toLocaleDateString('pt-BR')
                        ) : '—'}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-amber-200">
                        R$ {(o.ORC_VALOR_TOTAL || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-white/10 bg-white/[0.01] flex justify-end">
              <button onClick={() => setVendedorSelecionado(null)} className="px-6 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE 360 */}
      {clienteModal && (
        <Cliente360Modal 
          codigoCliente={clienteModal.codigo} 
          lojaCliente={clienteModal.loja} 
          onClose={() => setClienteModal(null)} 
        />
      )}

    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, accentColor, href }: any) {
  const colors: Record<string, { bg: string, glow: string }> = {
    red: { bg: 'bg-red-500/10', glow: 'bg-red-500/50' },
    sky: { bg: 'bg-sky-500/10', glow: 'bg-sky-500/50' },
    emerald: { bg: 'bg-emerald-500/10', glow: 'bg-emerald-500/50' },
    amber: { bg: 'bg-amber-500/10', glow: 'bg-amber-500/50' },
  };
  const accent = colors[accentColor] || colors.sky;

  const CardContent = (
    <div className={`glass-panel p-5 flex flex-col relative overflow-hidden group ${href ? 'cursor-pointer hover:bg-white/[0.02]' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${accent.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wide">{title}</h3>
        <div className={`p-2 rounded-lg ${accent.bg}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1 group-hover:scale-[1.02] origin-left transition-transform">{value}</div>
      <p className="text-[11px] text-gray-500 mt-auto">{subtitle}</p>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{CardContent}</Link>;
  }

  return CardContent;
}
