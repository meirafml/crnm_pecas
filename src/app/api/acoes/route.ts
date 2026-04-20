import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — Lista ações com filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendedor = searchParams.get('vendedor');
    const status = searchParams.get('status');
    const prioridade = searchParams.get('prioridade');
    const cliente = searchParams.get('codigo_cliente');

    let query = supabase
      .from('crm_acoes')
      .select('*')
      .order('data_vencimento', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (vendedor) query = query.eq('vendedor_responsavel', vendedor);
    if (status) {
      if (status === 'ATIVAS') {
        query = query.in('status', ['PENDENTE', 'EM_ANDAMENTO']);
      } else {
        query = query.eq('status', status);
      }
    }
    if (prioridade) query = query.eq('prioridade', prioridade);
    if (cliente) query = query.eq('codigo_cliente', cliente);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — Cria nova ação
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const acao = {
      tipo: body.tipo || 'OUTRO',
      titulo: body.titulo,
      descricao: body.descricao || null,
      prioridade: body.prioridade || 'MEDIA',
      status: 'PENDENTE',
      codigo_cliente: body.codigo_cliente || null,
      loja_cliente: body.loja_cliente || null,
      nome_cliente: body.nome_cliente || null,
      numero_orcamento: body.numero_orcamento || null,
      vendedor_responsavel: body.vendedor_responsavel || null,
      nome_vendedor: body.nome_vendedor || null,
      criado_por: body.criado_por || 'GESTOR',
      data_vencimento: body.data_vencimento || null,
      origem: body.origem || 'MANUAL',
      data_criacao: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('crm_acoes')
      .insert(acao)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
