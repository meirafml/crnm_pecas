'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface DataContextProps {
  clientes: any[];
  orcamentos: any[];
  maquinas: any[];
  acoes: any[];
  loading: boolean;
  ultimaSync: string;
  refreshAcoes: () => void;
}

const DataContext = createContext<DataContextProps>({
  clientes: [],
  orcamentos: [],
  maquinas: [],
  acoes: [],
  loading: true,
  ultimaSync: '',
  refreshAcoes: () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [maquinas, setMaquinas] = useState<any[]>([]);
  const [acoes, setAcoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaSync, setUltimaSync] = useState<string>('');

  const fetchAcoes = useCallback(async () => {
    try {
      const res = await fetch('/api/acoes');
      const data = await res.json();
      if (Array.isArray(data)) setAcoes(data);
    } catch (err) {
      console.error('Erro ao carregar ações:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function carregarDados() {
      try {
        const isDemo = typeof window !== 'undefined' && window.location.search.includes('demo=true');
        
        let cli, orc, maq, acoesData;
        const CACHE_KEY = 'crm_data_cache';
        const CACHE_TIME_KEY = 'crm_data_time';
        const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora
        const now = Date.now();

        if (isDemo) {
          const res = await fetch('/demo_data.json');
          const demo = await res.json();
          cli = demo.clientes;
          orc = demo.orcamentos;
          maq = demo.maquinas;
          acoesData = demo.acoes;
        } else {
          let useCache = false;
          if (typeof window !== 'undefined') {
            const cacheStr = sessionStorage.getItem(CACHE_KEY);
            const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);
            if (cacheStr && cacheTime && (now - parseInt(cacheTime) < CACHE_TTL_MS)) {
              try {
                const data = JSON.parse(cacheStr);
                cli = data.cli;
                orc = data.orc;
                maq = data.maq;
                acoesData = data.acoesData;
                useCache = true;
              } catch (e) {
                console.warn('Erro ao ler cache do sessionStorage', e);
              }
            }
          }

          if (!useCache) {
            const [resCli, resOrc, resMaq, resAcoes] = await Promise.all([
              fetch('/api/dados?tabela=crm_clientes'),
              fetch('/api/dados?tabela=crm_orcamentos'),
              fetch('/api/dados?tabela=crm_parquemaquinas'),
              fetch('/api/acoes'),
            ]);
            [cli, orc, maq, acoesData] = await Promise.all([resCli.json(), resOrc.json(), resMaq.json(), resAcoes.json()]);
            
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ cli, orc, maq, acoesData }));
                sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
              } catch (e) {
                console.warn('SessionStorage cheio, ignorando cache local', e);
              }
            }
          }
        }
        
        if (isMounted) {
          if (Array.isArray(cli)) setClientes(cli);
          if (Array.isArray(orc)) setOrcamentos(orc);
          if (Array.isArray(maq)) setMaquinas(maq);
          if (Array.isArray(acoesData)) setAcoes(acoesData);

          const todos = [...(Array.isArray(cli) ? cli : []), ...(Array.isArray(orc) ? orc : [])];
          if (todos.length > 0) {
             const datas = todos.filter(r => r.updated_at).map(r => new Date(r.updated_at).getTime());
             if (datas.length > 0) {
               setUltimaSync(new Date(Math.max(...datas)).toLocaleString('pt-BR'));
             }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados pro cache global:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    carregarDados();
    return () => { isMounted = false; };
  }, []);

  return (
    <DataContext.Provider value={{ clientes, orcamentos, maquinas, acoes, loading, ultimaSync, refreshAcoes: fetchAcoes }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
