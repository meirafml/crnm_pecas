import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Tenta carregar as variaveis do arquivo .env.local
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
} catch (e) {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Credenciais do Supabase ausentes.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function gerarAcoesAuto() {
  console.log("🤖 Iniciando rotina de geração de ações automáticas...");

  let acoesCriadas = 0;

  // 1. Buscar ações automáticas que já estão pendentes (evitar duplicadas)
  const { data: acoesPendentes, error: errAcoes } = await supabase
    .from('crm_acoes')
    .select('codigo_cliente, loja_cliente, numero_orcamento, tipo')
    .in('status', ['PENDENTE', 'EM_ANDAMENTO', 'REAGENDADA'])
    .eq('origem', 'SISTEMA_AUTO');

  if (errAcoes) {
    console.error("Erro ao buscar ações pendentes:", errAcoes);
    return;
  }

  // --- REGRA 1: EVASÃO DE CLIENTES (CHURN) ---
  console.log("\n🔍 Verificando clientes para Resgate (Inatividade)...");
  
  const { data: clientes, error: errClientes } = await supabase
    .from('crm_clientes')
    .select('CODIGO_CLIENTE, LOJA_CLIENTE, NOME_CLIENTE, VENDEDOR_RESP, NOME_VENDEDOR_RESP, DIAS_SEM_COMPRA')
    // Pega só ativos para tentar resgatar
    .eq('STATUS_BASE', 'ATIVO')
    .not('DIAS_SEM_COMPRA', 'is', null);

  if (errClientes) {
    console.error("Erro ao buscar clientes:", errClientes);
  } else {
    for (const c of clientes) {
      if (c.DIAS_SEM_COMPRA > 120) {
        // Verifica se já existe uma ação de resgate (LIGAR) para ele
        const jaExiste = acoesPendentes?.some(a => 
          String(a.codigo_cliente) === String(c.CODIGO_CLIENTE) && 
          String(a.loja_cliente) === String(c.LOJA_CLIENTE) && 
          a.tipo === 'LIGAR'
        );

        if (!jaExiste) {
          const payload = {
            titulo: `Resgate de Inatividade (${c.DIAS_SEM_COMPRA} dias)`,
            tipo: 'LIGAR',
            prioridade: c.DIAS_SEM_COMPRA > 90 ? 'URGENTE' : 'ALTA',
            descricao: `Cliente ativo sem fluxo financeiro há ${c.DIAS_SEM_COMPRA} dias.\nReative o relacionamento e identifique o motivo do afastamento.`,
            codigo_cliente: c.CODIGO_CLIENTE,
            loja_cliente: c.LOJA_CLIENTE,
            nome_cliente: c.NOME_CLIENTE,
            vendedor_responsavel: c.VENDEDOR_RESP,
            nome_vendedor: c.NOME_VENDEDOR_RESP,
            origem: 'SISTEMA_AUTO',
            criado_por: 'SISTEMA',
            data_vencimento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +2 dias
          };

          const { error } = await supabase.from('crm_acoes').insert(payload);
          if (!error) {
            console.log(`✅ Ação gerada: Resgate para cliente ${c.NOME_CLIENTE}`);
            acoesCriadas++;
          }
        }
      }
    }
  }

  // --- REGRA 2: PIPELINE COMERCIAL (FOLLOW-UP) ---
  console.log("\n🔍 Verificando orçamentos 'esfriando' (> 15 dias e < 45 dias)...");
  
  const { data: orcamentos, error: errOrcamentos } = await supabase
    .from('crm_orcamentos')
    .select('*');

  if (errOrcamentos) {
    console.error("Erro ao buscar orçamentos:", errOrcamentos);
  } else {
    const hoje = new Date();
    for (const o of orcamentos) {
      if (!o.ORC_DATA_EMISSAO_ORCAMENTO) continue;
      
      const dataEmissao = new Date(o.ORC_DATA_EMISSAO_ORCAMENTO);
      const diasAberto = Math.floor((hoje.getTime() - dataEmissao.getTime()) / (1000 * 60 * 60 * 24));

      if (diasAberto > 15 && diasAberto < 45) {
        // Verifica se já existe follow-up para este orçamento
        const jaExiste = acoesPendentes?.some(a => 
          a.numero_orcamento === String(o.ORC_NUMERO_ORCAMENTO) && 
          a.tipo === 'FOLLOW_UP_ORCAMENTO'
        );

        if (!jaExiste) {
          const payload = {
            titulo: `Follow-up de Orçamento Esfriando (#${o.ORC_NUMERO_ORCAMENTO})`,
            tipo: 'FOLLOW_UP_ORCAMENTO',
            prioridade: (o.ORC_VALOR_TOTAL || 0) > 5000 ? 'ALTA' : 'MEDIA',
            descricao: `O orçamento nº ${o.ORC_NUMERO_ORCAMENTO} no valor de R$ ${o.ORC_VALOR_TOTAL || 0} já tem ${diasAberto} dias.\nLigue para o cliente e tente o fechamento comercial.`,
            codigo_cliente: o.CODIGO_CLIENTE,
            loja_cliente: o.LOJA_CLIENTE,
            nome_cliente: o.CLIENTE_ORC,
            numero_orcamento: String(o.ORC_NUMERO_ORCAMENTO),
            vendedor_responsavel: o.ORC_CODIGO_VENDEDOR,
            nome_vendedor: o.ORC_NOME_VENDEDOR,
            origem: 'SISTEMA_AUTO',
            criado_por: 'SISTEMA',
            data_vencimento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +1 dia
          };

          const { error } = await supabase.from('crm_acoes').insert(payload);
          if (!error) {
            console.log(`✅ Ação gerada: Follow-up Orç #${o.ORC_NUMERO_ORCAMENTO} - ${o.CLIENTE_ORC}`);
            acoesCriadas++;
          }
        }
      }
    }
  }

  console.log(`\n🎉 Processo finalizado! ${acoesCriadas} novas ações automáticas geradas.`);
}

gerarAcoesAuto();
