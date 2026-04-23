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

    // Protheus geralmente usa zeros a esquerda (6 para código, 2 para loja)
    // Se o banco salvou sem zeros (int8), String() e padStart previnem erros de tipagem
    const codPad = String(codigo_cliente).padStart(6, '0');
    const lojaPad = String(loja_cliente).padStart(2, '0');

    // Busca o Cliente Principal
    const { data: clienteData, error: errCli } = await supabase
      .from('crm_clientes')
      .select('*')
      .or(`and(CODIGO_CLIENTE.eq.${codigo_cliente},LOJA_CLIENTE.eq.${loja_cliente}),and(CODIGO_CLIENTE.eq.${codPad},LOJA_CLIENTE.eq.${lojaPad})`)
      .limit(1);

    if (errCli) throw errCli;
    if (!clienteData || clienteData.length === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado na base.' }, { status: 404 });
    }
    
    const cliente = clienteData[0];

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
