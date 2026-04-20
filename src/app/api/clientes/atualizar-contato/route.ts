import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      codigo_cliente,
      loja_cliente,
      nome_cliente,
      email_antigo,
      email_novo,
      telefone_antigo,
      telefone_novo,
      vendedor_solicitante,
    } = body;

    if (!codigo_cliente || !loja_cliente) {
      return NextResponse.json({ error: 'Faltam parâmetros de identificação (código e loja).' }, { status: 400 });
    }

    // 1. Inserir log na tabela de solicitações
    const { error: errLog } = await supabase
      .from('crm_solicitacoes_alteracao')
      .insert({
        codigo_cliente,
        loja_cliente,
        nome_cliente,
        email_antigo,
        email_novo,
        telefone_antigo,
        telefone_novo,
        vendedor_solicitante,
        status: 'PENDENTE'
      });

    if (errLog) {
      console.error('Erro ao inserir log de solicitação:', errLog);
      return NextResponse.json({ error: 'Erro ao registrar solicitação de alteração.' }, { status: 500 });
    }

    // 2. Atualizar tabela crm_clientes para refletir imediatamente na UI
    // Nota: Como o ERP sincroniza à noite, este valor será provisório se não for
    // efetivado manualmente pela administração no ERP baseado na tabela de solicitações.
    const updatePayload: any = {};
    if (email_novo !== undefined) updatePayload.EMAIL = email_novo;
    if (telefone_novo !== undefined) {
      updatePayload.TELEFONE = telefone_novo;
      updatePayload.CELULAR_WHATSAPP_CONTATO = telefone_novo; // Atualiza ambos pra garantir
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: errUpdate } = await supabase
        .from('crm_clientes')
        .update(updatePayload)
        .eq('CODIGO_CLIENTE', codigo_cliente)
        .eq('LOJA_CLIENTE', loja_cliente);

      if (errUpdate) {
        console.error('Erro ao atualizar contato provisório no crm_clientes:', errUpdate);
        // Mesmo com erro na atualização visual, o log foi salvo, então retornaremos sucesso parcial ou erro não bloqueante
      }
    }

    return NextResponse.json({ success: true, message: 'Solicitação registrada e contato provisório atualizado com sucesso.' });

  } catch (err: any) {
    console.error('Erro na API de atualizar contato:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
