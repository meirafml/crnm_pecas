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

        if (isDemo) {
          const res = await fetch('/demo_data.json');
          const demo = await res.json();
          cli = demo.clientes;
          orc = demo.orcamentos;
          maq = demo.maquinas;
          acoesData = demo.acoes;
        } else {
          const [resCli, resOrc, resMaq, resAcoes] = await Promise.all([
            fetch('/api/dados?tabela=crm_clientes'),
            fetch('/api/dados?tabela=crm_orcamentos'),
            fetch('/api/dados?tabela=crm_parquemaquinas'),
            fetch('/api/acoes'),
          ]);
          [cli, orc, maq, acoesData] = await Promise.all([resCli.json(), resOrc.json(), resMaq.json(), resAcoes.json()]);
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
