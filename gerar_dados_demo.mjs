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

// Nomes de fazendas/empresas ficticias
const nomesFicticios = [
  "Fazenda Por do Sol", "Agropecuária Vale Verde", "Irmãos Souza Agronegócios", "Celeiro do Brasil LTDA", 
  "Agropecuária Boa Vista", "Fazenda Santa Cruz", "Cooperativa Agrícola Sul", "Nova Era Plantio", 
  "Fazenda Nova Esperança", "Campos Verdes SA", "Grupo Agro Silva", "Agropecuária Rio Limpo",
  "Ouro Verde Grãos", "Fazenda Três Poderes", "Agropecuária Estrela"
];

const vendedoresFicticios = ["Pedro Souza", "Mariana Silva", "Lucas Almeida", "Ana Costa", "Rafael Lima"];

function getFakeName(index, isPerson = false) {
  if (isPerson) return vendedoresFicticios[index % vendedoresFicticios.length];
  return `${nomesFicticios[index % nomesFicticios.length]} - Filial ${Math.floor(index/nomesFicticios.length) + 1}`;
}

async function gerarDemo() {
  console.log("Iniciando geração de dados DEMO (Anonimizando dados reais)...");

  // Baixar dados reais
  const { data: clientes } = await supabase.from('crm_clientes').select('*');
  const { data: orcamentos } = await supabase.from('crm_orcamentos').select('*');
  const { data: maquinas } = await supabase.from('crm_parquemaquinas').select('*');
  const { data: acoes } = await supabase.from('crm_acoes').select('*');

  // Mapas para manter consistência
  const mapClientes = {};
  const mapVendedores = {};

  // Obfuscar Clientes
  const clientesDemo = clientes.map((c, i) => {
    const fakeNome = getFakeName(i);
    const key = `${c.CODIGO_CLIENTE}-${c.LOJA_CLIENTE}`;
    mapClientes[key] = fakeNome;
    
    if (c.VENDEDOR_RESP && !mapVendedores[c.VENDEDOR_RESP]) {
       mapVendedores[c.VENDEDOR_RESP] = getFakeName(Object.keys(mapVendedores).length, true);
    }

    return {
      ...c,
      NOME_CLIENTE: fakeNome,
      CNPJ_CPF: "00.000.000/0001-00",
      TELEFONE: "(00) 99999-9999",
      CELULAR_WHATSAPP_CONTATO: "(00) 99999-9999",
      EMAIL: `contato@email${i}.com`,
      ENDERECO: "Rodovia Fictícia, km 10",
      NOME_VENDEDOR_RESP: mapVendedores[c.VENDEDOR_RESP] || "Vendedor Não Designado"
    };
  });

  // Obfuscar Orçamentos
  const orcamentosDemo = orcamentos.map((o) => {
    const key = `${o.CODIGO_CLIENTE}-${o.LOJA_CLIENTE}`;
    return {
      ...o,
      CLIENTE_ORC: mapClientes[key] || "Cliente Desconhecido",
      ORC_NOME_VENDEDOR: mapVendedores[o.ORC_CODIGO_VENDEDOR] || "Vendedor Não Designado",
      ORC_NUMERO_ORCAMENTO: `ORC-${Math.floor(Math.random()*90000)+10000}`
    };
  });

  // Obfuscar Parque de Maquinas
  const maquinasDemo = maquinas.map((m) => {
    const key = `${m.COD_CLIENTE}-${m.LOJA_CLIENTE}`;
    return {
      ...m,
      NOME_CLIENTE: mapClientes[key] || "Cliente Desconhecido",
      NOME_VENDEDOR: mapVendedores[m.COD_VENDEDOR] || "Vendedor Não Designado",
      CHASSI: `CHASSI-${Math.floor(Math.random()*9999999)}`,
      ENDERECO: "Endereço Rural SN",
      TELEFONE: "(00) 99999-9999",
      EMAIL: "maquina@cliente.com"
    };
  });

  // Obfuscar Ações
  const acoesDemo = acoes.map((a) => {
    const key = `${a.codigo_cliente}-${a.loja_cliente}`;
    return {
      ...a,
      nome_cliente: mapClientes[key] || "Cliente Desconhecido",
      nome_vendedor: mapVendedores[a.vendedor_responsavel] || "Vendedor Não Designado",
      titulo: a.titulo.replace(/#\w+/g, `#ORC-FAKE`), 
    };
  });

  const payloadDemo = {
    clientes: clientesDemo,
    orcamentos: orcamentosDemo,
    maquinas: maquinasDemo,
    acoes: acoesDemo
  };

  fs.writeFileSync('./public/demo_data.json', JSON.stringify(payloadDemo, null, 2));

  console.log("✅ Arquivo de Demo gerado com sucesso em: /public/demo_data.json");
}

gerarDemo().catch(console.error);
