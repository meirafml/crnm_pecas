import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tabela = searchParams.get('tabela') || 'clientes';

    let data = null;

    async function fetchAll(tableName: string, orderCol: string) {
      let allData: any[] = [];
      let from = 0;
      let step = 999;
      let hasMore = true;
      while (hasMore) {
        // Usa `id` como ordenação secundária para garantir estabilidade na paginação e evitar linhas duplicadas/puladas.
        const { data, error } = await supabase.from(tableName).select('*').order(orderCol, { ascending: false, nullsFirst: false }).order('id', { ascending: true }).range(from, from + step);
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
        data = await fetchAll('crm_clientes', 'DIAS_SEM_COMPRA');
        break;
      case 'orcamentos':
      case 'crm_orcamentos':
        data = await fetchAll('crm_orcamentos', 'ORC_VALOR_TOTAL');
        break;
      case 'maquinas':
      case 'crm_parquemaquinas':
        data = await fetchAll('crm_parquemaquinas', 'TOTAL');
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

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
