'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, MapPin, Phone, Mail, Tractor, ReceiptText, ShieldCheck, Flame, Skull, AlertTriangle, MessageCircle } from 'lucide-react';

interface Cliente360ModalProps {
  codigoCliente: string;
  lojaCliente: string;
  onClose: () => void;
}

export default function Cliente360Modal({ codigoCliente, lojaCliente, onClose }: Cliente360ModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dados/cliente360?codigo_cliente=${codigoCliente}&loja_cliente=${lojaCliente}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [codigoCliente, lojaCliente]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Loader2 size={48} className="text-sky-400 animate-spin" />
      </div>
    );
  }

  const { cliente, maquinas, orcamentos } = data;
  
  // Dados calculados
  const diasSemCompra = cliente.DIAS_SEM_COMPRA || 0;
  let statusCor = 'text-emerald-400';
  let statusBg = 'bg-emerald-500/10';
  let statusIcon = <ShieldCheck size={18} />;
  let statusTexto = 'Base Saudável';

  if (diasSemCompra > 90) {
    statusCor = 'text-red-400'; statusBg = 'bg-red-500/10'; statusIcon = <Skull size={18} />; statusTexto = 'Evasão (Churn)';
  } else if (diasSemCompra > 60) {
    statusCor = 'text-orange-400'; statusBg = 'bg-orange-500/10'; statusIcon = <Flame size={18} />; statusTexto = 'Risco Alto';
  } else if (diasSemCompra > 30) {
    statusCor = 'text-amber-400'; statusBg = 'bg-amber-500/10'; statusIcon = <AlertTriangle size={18} />; statusTexto = 'Atenção (Esfriando)';
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#0b101a] border border-white/10 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/[0.02] shrink-0 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

          <div className="flex gap-4 items-center relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl border ${statusBg} ${statusCor} border-current/20`}>
              {(cliente.NOME_CLIENTE || '??').substring(0,2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white uppercase">{cliente.NOME_CLIENTE}</h2>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-current ${statusBg} ${statusCor}`}>
                  {statusIcon} {statusTexto}
                </span>
                {cliente.STATUS_BASE === 'BLOQUEADO' && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-600 border border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                    ⚠️ BLOQUEADO
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 flex items-center gap-4">
                <span>Cod: <strong className="text-gray-300 font-mono">{cliente.CODIGO_CLIENTE}</strong> Lj: {cliente.LOJA_CLIENTE}</span>
                <span>CNPJ/CPF: {cliente.CNPJ_CPF}</span>
              </p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10">
            <X size={24} />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LADO ESQUERDO: INFOS DO CLIENTE */}
            <div className="space-y-6">
              
              {/* Card Contato */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-white/5 pb-2">Contato e Endereço</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-sky-400 shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-white">{cliente.CIDADE} - {cliente.UF}</p>
                      <p className="text-xs text-gray-500">Mapeamento Geográfico</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-emerald-400 shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-white">{cliente.TELEFONE || cliente.CELULAR_WHATSAPP_CONTATO || 'Sem telefone registrado'}</p>
                      <p className="text-xs text-gray-500">Contato Direto</p>
                    </div>
                    {/* Botão de Integração WhatsApp */}
                    {(cliente.TELEFONE || cliente.CELULAR_WHATSAPP_CONTATO) && (
                      <a 
                        href={`https://wa.me/55${(cliente.TELEFONE || cliente.CELULAR_WHATSAPP_CONTATO).replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-400 p-2 rounded-lg transition-colors border border-emerald-500/20"
                        title="Abrir no WhatsApp Web"
                      >
                         <MessageCircle size={16} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="text-amber-400 shrink-0" size={18} />
                    <div className="break-all">
                      <p className="text-sm text-white">{cliente.EMAIL || 'Não informado'}</p>
                      <p className="text-xs text-gray-500">E-mail Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Métricas e Vendedor */}
              <div className="glass-panel p-5 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.05)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-500 mb-2 border-b border-sky-500/20 pb-2">Desempenho Comercial</h3>
                
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Vendedor Responsável</p>
                  <p className="text-lg font-bold text-white leading-tight">{cliente.NOME_VENDEDOR_RESP || 'S/ Vendedor'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-gray-400 mb-1">Inatividade</p>
                      <p className={`text-2xl font-black ${statusCor}`}>{diasSemCompra} <span className="text-xs font-normal">dias</span></p>
                   </div>
                   <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-gray-400 mb-1">Volumetria</p>
                      <p className="text-2xl font-black text-sky-400">{cliente.NF_12M || 0} <span className="text-xs font-normal">NFs (12m)</span></p>
                   </div>
                </div>
              </div>

            </div>

            {/* LADO DIREITO: MÁQUINAS E ORÇAMENTOS */}
            <div className="md:col-span-2 space-y-6">
              
              {/* OPORTUNIDADES: ORÇAMENTOS ABERTOS */}
              <div className="glass-panel overflow-hidden border border-emerald-500/20 bg-emerald-950/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                 <div className="p-4 border-b border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                       <ReceiptText size={18} /> 
                       Orçamentos Pendentes ({orcamentos.length})
                    </h3>
                    {orcamentos.length > 0 && (
                      <span className="font-bold text-emerald-300 text-lg">
                        Total R$ {orcamentos.reduce((acc:any, o:any) => acc + o.ORC_VALOR_TOTAL, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </span>
                    )}
                 </div>
                 <div className="p-0">
                    {orcamentos.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">Não há orçamentos em negociação com este cliente.</div>
                    ) : (
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-[10px] uppercase bg-black/20 text-gray-500">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Cód / Descrição</th>
                            <th className="px-4 py-3 font-semibold text-center">Nº Orçamento</th>
                            <th className="px-4 py-3 font-semibold text-center">Emissão</th>
                            <th className="px-4 py-3 font-semibold text-right">Valor R$</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {orcamentos.map((o: any) => (
                            <tr key={o.id} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3 max-w-[200px]">
                                <div className="font-mono text-xs text-sky-400">{o.CODIGO_PRODUTO_ORC}</div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-400 font-mono text-xs">{o.ORC_NUMERO_ORCAMENTO}</td>
                              <td className="px-4 py-3 text-center text-gray-500 text-xs">{o.ORC_DATA_EMISSAO_ORCAMENTO || '—'}</td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-300">
                                {o.ORC_VALOR_TOTAL?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                 </div>
              </div>

              {/* CROSS-SELL: PARQUE DE MÁQUINAS */}
              <div className="glass-panel overflow-hidden border border-amber-500/20 bg-amber-950/20">
                 <div className="p-4 border-b border-amber-500/20 bg-amber-500/5 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                       <Tractor size={18} /> 
                       Parque Instalado ({maquinas.length})
                    </h3>
                    <p className="text-xs text-gray-400">Oportunidade para Cross-Sell de Peças</p>
                 </div>
                 <div className="p-0">
                    {maquinas.length === 0 ? (
                       <div className="p-8 text-center text-gray-500">Nenhum equipamento registrado (Tabela de Maquinas ERP).</div>
                    ) : (
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-[10px] uppercase bg-black/20 text-gray-500">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Modelo / Categoria</th>
                            <th className="px-4 py-3 font-semibold">Fabricante</th>
                            <th className="px-4 py-3 font-semibold text-center">Chassi</th>
                            <th className="px-4 py-3 font-semibold text-center">Emissão NF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {maquinas.map((m: any) => (
                            <tr key={m.id} className="hover:bg-white/[0.02]">
                              <td className="px-4 py-3">
                                <div className="font-bold text-white">{m.MODELO || 'N/A'}</div>
                                <div className="text-[10px] text-gray-500 uppercase">{m.CATEGORIA || 'SEM CATEGORIA'}</div>
                              </td>
                              <td className="px-4 py-3 text-gray-300 text-xs">{m.FABRICANTE || '—'}</td>
                              <td className="px-4 py-3 text-center text-amber-400/80 font-mono text-xs">{m.CHASSI || '—'}</td>
                              <td className="px-4 py-3 text-center text-gray-500 text-xs">{m.EMISSAO || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                 </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
