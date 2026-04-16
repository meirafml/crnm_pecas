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
    const codigo_cliente = searchParams.get('codigo_cliente');
    const loja_cliente = searchParams.get('loja_cliente');

    if (!codigo_cliente || !loja_cliente) {
      return NextResponse.json({ error: 'Faltam parâmetros' }, { status: 400 });
    }

    // Busca o Cliente Principal
    const { data: cliente, error: errCli } = await supabase
      .from('crm_clientes')
      .select('*')
      .eq('CODIGO_CLIENTE', codigo_cliente)
      .eq('LOJA_CLIENTE', loja_cliente)
      .single();

    if (errCli) throw errCli;

    // Busca as Máquinas desse cliente (Venda Cruzada)
    const { data: maquinas, error: errMaq } = await supabase
      .from('crm_parquemaquinas')
      .select('*')
      .eq('COD_CLIENTE', codigo_cliente)
      .eq('LOJA_CLIENTE', loja_cliente);

    if (errMaq) throw errMaq;

    // Busca os Orçamentos desse cliente
    const { data: orcamentos, error: errOrc } = await supabase
      .from('crm_orcamentos')
      .select('*')
      .eq('CODIGO_CLIENTE', codigo_cliente)
      .eq('LOJA_CLIENTE', loja_cliente)
      .order('ORC_VALOR_TOTAL', { ascending: false });

    if (errOrc) throw errOrc;

    return NextResponse.json({
      cliente,
      maquinas: maquinas || [],
      orcamentos: orcamentos || []
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
