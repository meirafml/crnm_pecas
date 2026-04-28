import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache em memória para o servidor (útil para localhost e instâncias quentes)
const memoryCache = new Map<string, { data: any, time: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

// Colunas mínimas necessárias para o frontend — evita carregar campos de padding do Protheus
const COLS_CLIENTES = [
  'id', 'FILIAL', 'CODIGO_CLIENTE', 'LOJA_CLIENTE', 'NOME_CLIENTE',
  'CNPJ_CPF', 'CIDADE', 'UF', 'VENDEDOR_RESP', 'NOME_VENDEDOR_RESP',
  'DDD', 'TELEFONE', 'CELULAR_WHATSAPP_CONTATO', 'EMAIL',
  'DIAS_SEM_COMPRA', 'DATA_ULT_COMPRA', 'NF_12M', 'STATUS_BASE', 'updated_at'
].join(',');

const COLS_ORCAMENTOS = [
  'id', 'FILIAL_ORC', 'CODIGO_CLIENTE', 'LOJA_CLIENTE', 'CLIENTE_ORC',
  'ORC_DATA_EMISSAO_ORCAMENTO', 'ORC_DATA_ORCAMENTO', 'CODIGO_PRODUTO_ORC',
  'ORC_NUMERO_ORCAMENTO', 'ORC_SALDO_ORCAMENTO', 'ORC_VALOR_UNITARIO',
  'ORC_VALOR_TOTAL', 'ORC_CUSTO_PRODUTO', 'ORC_CODIGO_VENDEDOR',
  'ORC_NOME_VENDEDOR', 'STATUS', 'updated_at'
].join(',');

const COLS_MAQUINAS = [
  'id', 'FILIAL', 'FABRICANTE', 'MODELO', 'CATEGORIA', 'ESTADO',
  'CHASSI', 'REGIAO', 'COD_VENDEDOR', 'NOME_VENDEDOR', 'EMISSAO',
  'NOTA_FISCAL', 'COD_CLIENTE', 'CODIGO_CLIENTE', 'LOJA_CLIENTE',
  'NOME_CLIENTE', 'MUNICIPIO', 'UF_MUN_CLIENTE', 'TOTAL'
].join(',');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabela = searchParams.get('tabela') || 'clientes';

    // 1. Verifica Cache em Memória
    const cached = memoryCache.get(tabela);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    let data = null;

    async function fetchAll(tableName: string, columns: string, orderCol: string) {
      let allData: any[] = [];
      let from = 0;
      const step = 999;
      let hasMore = true;
      while (hasMore) {
        // Usa `id` como ordenação secundária para garantir estabilidade na paginação e evitar linhas duplicadas/puladas.
        const { data, error } = await supabase.from(tableName).select(columns).order(orderCol, { ascending: false, nullsFirst: false }).order('id', { ascending: true }).range(from, from + step);
        if (error) throw error;
        if (data && data.length > 0) {
          allData = allData.concat(data);
          from += step + 1;
        } else {
          hasMore = false;
        }
      }
      return allData;
    }

    switch (tabela) {
      case 'clientes':
      case 'crm_clientes':
        data = await fetchAll('crm_clientes', COLS_CLIENTES, 'DIAS_SEM_COMPRA');
        break;
      case 'orcamentos':
      case 'crm_orcamentos':
        data = await fetchAll('crm_orcamentos', COLS_ORCAMENTOS, 'ORC_VALOR_TOTAL');
        break;
      case 'maquinas':
      case 'crm_parquemaquinas':
        data = await fetchAll('crm_parquemaquinas', COLS_MAQUINAS, 'TOTAL');
        break;
      case 'resumo':
        // KPIs rápidos
        const [cli, orc, maq] = await Promise.all([
          supabase.from('crm_clientes').select('id', { count: 'exact', head: true }),
          supabase.from('crm_orcamentos').select('id', { count: 'exact', head: true }),
          supabase.from('crm_parquemaquinas').select('id', { count: 'exact', head: true }),
        ]);
        return NextResponse.json({
          clientes: cli.count || 0,
          orcamentos: orc.count || 0,
          maquinas: maq.count || 0,
        });
      default:
        return NextResponse.json({ error: 'Tabela inválida', recebido: tabela }, { status: 400 });
    }

    // Atualiza o Cache em Memória
    memoryCache.set(tabela, { data: data || [], time: Date.now() });

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
