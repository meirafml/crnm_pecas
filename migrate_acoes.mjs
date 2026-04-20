// Script de Migração — Cria tabela crm_acoes no Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('🔄 Criando tabela crm_acoes no Supabase...');

  // Usar rpc para executar SQL raw
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS crm_acoes (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        tipo text NOT NULL DEFAULT 'OUTRO',
        titulo text NOT NULL,
        descricao text,
        prioridade text NOT NULL DEFAULT 'MEDIA',
        status text NOT NULL DEFAULT 'PENDENTE',
        codigo_cliente bigint,
        loja_cliente bigint,
        nome_cliente text,
        numero_orcamento text,
        vendedor_responsavel text,
        nome_vendedor text,
        criado_por text NOT NULL DEFAULT 'GESTOR',
        data_criacao timestamptz DEFAULT now(),
        data_vencimento date,
        data_conclusao timestamptz,
        resultado text,
        observacoes text,
        origem text DEFAULT 'MANUAL',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_acoes_vendedor ON crm_acoes(vendedor_responsavel);
      CREATE INDEX IF NOT EXISTS idx_acoes_status ON crm_acoes(status);
      CREATE INDEX IF NOT EXISTS idx_acoes_vencimento ON crm_acoes(data_vencimento);
      CREATE INDEX IF NOT EXISTS idx_acoes_cliente ON crm_acoes(codigo_cliente, loja_cliente);
    `
  });

  if (error) {
    console.log('⚠️  RPC exec_sql não disponível. Tentando via REST insert...');
    console.log('');
    console.log('========================================');
    console.log('EXECUTE O SQL ABAIXO NO SUPABASE SQL EDITOR:');
    console.log('========================================');
    console.log(`
CREATE TABLE IF NOT EXISTS crm_acoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo text NOT NULL DEFAULT 'OUTRO',
  titulo text NOT NULL,
  descricao text,
  prioridade text NOT NULL DEFAULT 'MEDIA',
  status text NOT NULL DEFAULT 'PENDENTE',
  codigo_cliente bigint,
  loja_cliente bigint,
  nome_cliente text,
  numero_orcamento text,
  vendedor_responsavel text,
  nome_vendedor text,
  criado_por text NOT NULL DEFAULT 'GESTOR',
  data_criacao timestamptz DEFAULT now(),
  data_vencimento date,
  data_conclusao timestamptz,
  resultado text,
  observacoes text,
  origem text DEFAULT 'MANUAL',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acoes_vendedor ON crm_acoes(vendedor_responsavel);
CREATE INDEX IF NOT EXISTS idx_acoes_status ON crm_acoes(status);
CREATE INDEX IF NOT EXISTS idx_acoes_vencimento ON crm_acoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_acoes_cliente ON crm_acoes(codigo_cliente, loja_cliente);

-- Desabilitar RLS para V1 (sem auth)
ALTER TABLE crm_acoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir tudo na V1" ON crm_acoes FOR ALL USING (true) WITH CHECK (true);
    `);
    console.log('========================================');
    
    // Tentar criar via API REST como fallback
    console.log('\n🔄 Tentando verificar se a tabela já existe...');
    const { data: testData, error: testErr } = await supabase.from('crm_acoes').select('id').limit(1);
    if (!testErr) {
      console.log('✅ Tabela crm_acoes já existe! Pronta para uso.');
    } else if (testErr.message.includes('does not exist') || testErr.code === '42P01') {
      console.log('❌ Tabela não existe. Por favor execute o SQL acima no Supabase Dashboard.');
      console.log('   URL: https://supabase.com/dashboard → SQL Editor');
    } else {
      console.log('⚠️  Erro ao verificar:', testErr.message);
    }
  } else {
    console.log('✅ Tabela crm_acoes criada com sucesso!');
  }
}

migrate().catch(console.error);
