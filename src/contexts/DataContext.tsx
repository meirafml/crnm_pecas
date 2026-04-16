'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface DataContextProps {
  clientes: any[];
  orcamentos: any[];
  maquinas: any[];
  loading: boolean;
  ultimaSync: string;
}

const DataContext = createContext<DataContextProps>({
  clientes: [],
  orcamentos: [],
  maquinas: [],
  loading: true,
  ultimaSync: ''
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [maquinas, setMaquinas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaSync, setUltimaSync] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function carregarDados() {
      try {
        const [resCli, resOrc, resMaq] = await Promise.all([
          fetch('/api/dados?tabela=crm_clientes'),
          fetch('/api/dados?tabela=crm_orcamentos'),
          fetch('/api/dados?tabela=crm_parquemaquinas'),
        ]);
        const [cli, orc, maq] = await Promise.all([resCli.json(), resOrc.json(), resMaq.json()]);
        
        if (isMounted) {
          if (Array.isArray(cli)) setClientes(cli);
          if (Array.isArray(orc)) setOrcamentos(orc);
          if (Array.isArray(maq)) setMaquinas(maq);

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
    <DataContext.Provider value={{ clientes, orcamentos, maquinas, loading, ultimaSync }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
