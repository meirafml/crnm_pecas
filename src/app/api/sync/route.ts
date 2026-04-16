import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================================
// SANITIZADORES baseados no Dicionário de Dados do ERP Protheus/Bouwman
// =====================================================================

// Remove padding de espaços de TODOS os campos texto (Protheus preenche com espaços fixos)
function trimAll(record: any): any {
  const clean: any = {};
  for (const key of Object.keys(record)) {
    const val = record[key];
    if (typeof val === 'string') {
      clean[key] = val.trim();
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

// Converte campo financeiro BR (vírgula decimal) para número real
function parseFinanceiro(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  if (s === '') return null;
  // Remove pontos de milhar, troca vírgula por ponto
  const converted = s.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(converted);
  return isNaN(num) ? null : num;
}

// Converte campo que vem como número ou null (DIAS_SEM_COMPRA, NF_12M, QUANTIDADE, etc.)
function parseNumerico(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  if (s === '') return null;
  const num = parseFloat(s.replace(',', '.'));
  return isNaN(num) ? null : num;
}

// =====================================================================
// PROCESSADORES POR ENTIDADE (campos específicos do dicionário)
// =====================================================================

function processCliente(c: any): any {
  const r = trimAll(c);
  r.id = `${r.FILIAL}_${r.CODIGO_CLIENTE}_${r.LOJA_CLIENTE}`;
  // Campos numéricos do dicionário
  r.DIAS_SEM_COMPRA = parseNumerico(r.DIAS_SEM_COMPRA);
  r.NF_12M = parseNumerico(r.NF_12M);
  return r;
}

function processOrcamento(o: any): any {
  const r = trimAll(o);
  // Garante unicidade usando ORC_NUMERO_ORCAMENTO + CODIGO_PRODUTO_ORC
  r.id = `${r.FILIAL_ORC}_${r.ORC_NUMERO_ORCAMENTO}_${r.CODIGO_PRODUTO_ORC}`;
  // Campos financeiros BR (texto com vírgula) → número
  r.ORC_SALDO_ORCAMENTO = parseFinanceiro(r.ORC_SALDO_ORCAMENTO);
  r.ORC_VALOR_UNITARIO = parseFinanceiro(r.ORC_VALOR_UNITARIO);
  r.ORC_VALOR_TOTAL = parseFinanceiro(r.ORC_VALOR_TOTAL);
  r.ORC_CUSTO_PRODUTO = parseFinanceiro(r.ORC_CUSTO_PRODUTO);
  return r;
}

function processMaquina(m: any, index: number): any {
  const r = trimAll(m);
  // Usa UUID aleatório para evitar qualquer colisão na filial/chassi, 
  // já que o ERP pode enviar linhas duplicadas do mesmo equipamento nas consultas brutas.
  r.id = crypto.randomUUID();
  
  // Campos numéricos inteiros
  r.QUANTIDADE = parseNumerico(r.QUANTIDADE);
  r.NUMERO_DE_COMPRAS = parseNumerico(r.NUMERO_DE_COMPRAS);
  // Campo financeiro BR (texto com vírgula)
  r.TOTAL = parseFinanceiro(r.TOTAL);
  
  // Colunas não presentes no banco Supabase sendo descartadas:
  delete r.CUSTO;
  
  return r;
}

// =====================================================================
// ROTA POST: Recebe lotes do PowerShell e grava no Supabase
// =====================================================================
export async function POST(request: Request) {
  try {
    // Autenticação
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.SYNC_API_KEY || 'bouwman_sync_ak_7a8b9c0d1e2f3g4h5i';
    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const payload = await request.json();

    // Processar cada entidade com seu sanitizador específico
    const clientes = (payload.Clientes || []).map((c: any) => processCliente(c));
    const orcamentos = (payload.Orcamentos || []).map((o: any) => processOrcamento(o));
    const maquinas = (payload.Maquinas || []).map((m: any, i: number) => processMaquina(m, i));

    const erros: string[] = [];

    // UPSERT Clientes
    if (clientes.length > 0) {
      const { error } = await supabase.from('crm_clientes').upsert(clientes, { onConflict: 'id' });
      if (error) erros.push(`Clientes: ${error.message} | ${error.details || ''}`);
    }

    // UPSERT Orçamentos
    if (orcamentos.length > 0) {
      const { error } = await supabase.from('crm_orcamentos').upsert(orcamentos, { onConflict: 'id' });
      if (error) erros.push(`Orcamentos: ${error.message} | ${error.details || ''}`);
    }

    // UPSERT Máquinas
    if (maquinas.length > 0) {
      const { error } = await supabase.from('crm_parquemaquinas').upsert(maquinas, { onConflict: 'id' });
      if (error) erros.push(`Maquinas: ${error.message} | ${error.details || ''}`);
    }

    if (erros.length > 0) {
      console.error('Erros Supabase:', JSON.stringify(erros));
      return NextResponse.json({ error: 'Erro no banco', detalhes: erros }, { status: 500 });
    }

    const msg = `Sync OK: ${clientes.length} cli, ${orcamentos.length} orc, ${maquinas.length} maq`;
    console.log(msg);

    return NextResponse.json({
      success: true,
      message: msg,
      totais: { clientes: clientes.length, orcamentos: orcamentos.length, maquinas: maquinas.length }
    });

  } catch (error: any) {
    console.error('ERRO FATAL:', error.message || error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
