import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PATCH — Atualiza ação (concluir, atualizar status, resultado, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) updates.status = body.status;
    if (body.resultado) updates.resultado = body.resultado;
    if (body.observacoes !== undefined) updates.observacoes = body.observacoes;
    if (body.prioridade) updates.prioridade = body.prioridade;
    if (body.vendedor_responsavel) updates.vendedor_responsavel = body.vendedor_responsavel;
    if (body.nome_vendedor) updates.nome_vendedor = body.nome_vendedor;
    if (body.data_vencimento) updates.data_vencimento = body.data_vencimento;

    // Se concluindo, marcar data de conclusão
    if (body.status === 'CONCLUIDA') {
      updates.data_conclusao = new Date().toISOString();
    }

    // Se reagendando, limpar data de conclusão
    if (body.status === 'REAGENDADA' || body.status === 'PENDENTE') {
      updates.data_conclusao = null;
    }

    const { data, error } = await supabase
      .from('crm_acoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — Soft delete (marca como CANCELADA)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('crm_acoes')
      .update({ status: 'CANCELADA', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
