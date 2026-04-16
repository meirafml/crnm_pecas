import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log("Iniciando Seed de Dados Fictícios no Supabase...");

  const clientes = [
    {
      "FILIAL": "1",
      "CODIGO_CLIENTE": "C001",
      "LOJA_CLIENTE": "01",
      "NOME_CLIENTE": "FAZENDA PRIMAVERA",
      "CNPJ_CPF": "11.111.111/0001-11",
      "CIDADE": "CASTRO",
      "UF": "PR",
      "COD_IBGE": "4104907",
      "VENDEDOR_RESP": "V01",
      "NOME_VENDEDOR_RESP": "JOAO VENDEDOR",
      "DDD": "42",
      "TELEFONE": "42999991111",
      "CELULAR_WHATSAPP_CONTATO": "42999991111",
      "EMAIL": "contato@fazendaprimavera.com",
      "DIAS_SEM_COMPRA": 15,
      "DATA_ULT_COMPRA": "2024-03-01",
      "NF_12M": 5,
      "STATUS_BASE": "ATIVO"
    },
    {
      "FILIAL": "1",
      "CODIGO_CLIENTE": "C002",
      "LOJA_CLIENTE": "01",
      "NOME_CLIENTE": "AGROPECUARIA SAO JOAO",
      "CNPJ_CPF": "22.222.222/0001-22",
      "CIDADE": "XANXERE",
      "UF": "SC",
      "COD_IBGE": "4119905",
      "VENDEDOR_RESP": "V02",
      "NOME_VENDEDOR_RESP": "MARIA VENDEDORA",
      "DDD": "49",
      "TELEFONE": "49988882222",
      "CELULAR_WHATSAPP_CONTATO": "",
      "EMAIL": "compras@saojoaoagro.com",
      "DIAS_SEM_COMPRA": 45,
      "DATA_ULT_COMPRA": "2024-01-15",
      "NF_12M": 2,
      "STATUS_BASE": "ATIVO"
    },
    {
      "FILIAL": "1",
      "CODIGO_CLIENTE": "C003",
      "LOJA_CLIENTE": "01",
      "NOME_CLIENTE": "SILVA AGRONEGOCIOS",
      "CNPJ_CPF": "33.333.333/0001-33",
      "CIDADE": "PASSO FUNDO",
      "UF": "RS",
      "COD_IBGE": "4109401",
      "VENDEDOR_RESP": "V03",
      "NOME_VENDEDOR_RESP": "CARLOS REPRESENTANTE",
      "DDD": "54",
      "TELEFONE": "54977773333",
      "CELULAR_WHATSAPP_CONTATO": "54977773333",
      "EMAIL": "diretoria@silva.com",
      "DIAS_SEM_COMPRA": 120,
      "DATA_ULT_COMPRA": "2023-11-10",
      "NF_12M": 0,
      "STATUS_BASE": "BLOQUEADO"
    }
  ];

  // Datas calculadas para o Kanban
  const hoje = new Date();
  const dateStr = (dias) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - dias);
    return d.toISOString().split('T')[0];
  };

  const orcamentos = [
    {
      "FILIAL_ORC": "10101",
      "CODIGO_CLIENTE": "C001",
      "LOJA_CLIENTE": "01",
      "CLIENTE_ORC": "FAZENDA PRIMAVERA",
      "ORC_DATA_EMISSAO_ORCAMENTO": dateStr(5), // Quente
      "ORC_DATA_ORCAMENTO": dateStr(-10), // Validade no futuro
      "CODIGO_PRODUTO_ORC": "FILTRO-OLEO-X1",
      "ORC_NUMERO_ORCAMENTO": "ORC-0001",
      "ORC_SALDO_ORCAMENTO": 10,
      "ORC_VALOR_UNITARIO": 1500.00,
      "ORC_VALOR_TOTAL": 15000.00,
      "ORC_CUSTO_PRODUTO": 8000.00,
      "ORC_CODIGO_VENDEDOR": "V01",
      "ORC_NOME_VENDEDOR": "JOAO VENDEDOR"
    },
    {
      "FILIAL_ORC": "10101",
      "CODIGO_CLIENTE": "C002",
      "LOJA_CLIENTE": "01",
      "CLIENTE_ORC": "AGROPECUARIA SAO JOAO",
      "ORC_DATA_EMISSAO_ORCAMENTO": dateStr(12), // Em Negociação
      "ORC_DATA_ORCAMENTO": dateStr(0),
      "CODIGO_PRODUTO_ORC": "BOMBA-DAGUA",
      "ORC_NUMERO_ORCAMENTO": "ORC-0002",
      "ORC_SALDO_ORCAMENTO": 1,
      "ORC_VALOR_UNITARIO": 3200.00,
      "ORC_VALOR_TOTAL": 3200.00,
      "ORC_CUSTO_PRODUTO": 2000.00,
      "ORC_CODIGO_VENDEDOR": "V02",
      "ORC_NOME_VENDEDOR": "MARIA VENDEDORA"
    },
    {
      "FILIAL_ORC": "10201",
      "CODIGO_CLIENTE": "C002",
      "LOJA_CLIENTE": "01",
      "CLIENTE_ORC": "AGROPECUARIA SAO JOAO",
      "ORC_DATA_EMISSAO_ORCAMENTO": dateStr(25), // Esfriando
      "ORC_DATA_ORCAMENTO": dateStr(-5),
      "CODIGO_PRODUTO_ORC": "KIT-REVISAO-500H",
      "ORC_NUMERO_ORCAMENTO": "ORC-0003",
      "ORC_SALDO_ORCAMENTO": 2,
      "ORC_VALOR_UNITARIO": 8000.00,
      "ORC_VALOR_TOTAL": 16000.00,
      "ORC_CUSTO_PRODUTO": 10000.00,
      "ORC_CODIGO_VENDEDOR": "V02",
      "ORC_NOME_VENDEDOR": "MARIA VENDEDORA"
    },
    {
      "FILIAL_ORC": "10101",
      "CODIGO_CLIENTE": "C003",
      "LOJA_CLIENTE": "01",
      "CLIENTE_ORC": "SILVA AGRONEGOCIOS",
      "ORC_DATA_EMISSAO_ORCAMENTO": dateStr(45), // Congelado
      "ORC_DATA_ORCAMENTO": "2030-12-31",
      "CODIGO_PRODUTO_ORC": "PNEU-TRATOR-A",
      "ORC_NUMERO_ORCAMENTO": "ORC-0004",
      "ORC_SALDO_ORCAMENTO": 4,
      "ORC_VALOR_UNITARIO": 12000.00,
      "ORC_VALOR_TOTAL": 48000.00,
      "ORC_CUSTO_PRODUTO": 30000.00,
      "ORC_CODIGO_VENDEDOR": "V03",
      "ORC_NOME_VENDEDOR": "CARLOS REPRESENTANTE"
    }
  ];

  const maquinas = [
    {
      "FILIAL": "1",
      "FABRICANTE": "JOHN DEERE",
      "MODELO": "8R 310",
      "CATEGORIA": "TRATOR",
      "ESTADO": "USADO",
      "CODIGO": "M001",
      "CHASSI": "1RW8R310X001ABC",
      "REGIAO": "SUL",
      "QUANTIDADE": 1,
      "COD_VENDEDOR": "V01",
      "NOME_VENDEDOR": "JOAO VENDEDOR",
      "EMISSAO": "2020-05-15",
      "NOTA_FISCAL": "001234",
      "SERIE": "1",
      "UF_NOTA": "PR",
      "COD_CLIENTE": "C001",
      "LOJA_CLIENTE": "01",
      "NOME_CLIENTE": "FAZENDA PRIMAVERA",
      "UF_CLIENTE": "PR",
      "ENDERECO": "RODOVIA PR 123",
      "COD_MUN": "4104907",
      "MUNICIPIO": "CASTRO",
      "UF_MUN_CLIENTE": "PR",
      "DDD": "42",
      "TELEFONE": "42999991111",
      "PRIMEIRA_COMPRA": "2020-05-15",
      "ULTIMA_COMPRA": "2020-05-15",
      "NUMERO_DE_COMPRAS": 1,
      "EMAIL": "contato@fazendaprimavera.com",
      "TOTAL": 1800000.00,
      "TIPO_VENDA": "VENDA DIRETA"
    },
    {
      "FILIAL": "1",
      "FABRICANTE": "CLAAS",
      "MODELO": "LEXION 8800",
      "CATEGORIA": "COLHEITADEIRA",
      "ESTADO": "NOVO",
      "CODIGO": "M002",
      "CHASSI": "XYZCLAAS12345",
      "REGIAO": "SUL",
      "QUANTIDADE": 1,
      "COD_VENDEDOR": "V02",
      "NOME_VENDEDOR": "MARIA VENDEDORA",
      "EMISSAO": "2023-08-20",
      "NOTA_FISCAL": "004567",
      "SERIE": "1",
      "UF_NOTA": "SC",
      "COD_CLIENTE": "C002",
      "LOJA_CLIENTE": "01",
      "NOME_CLIENTE": "AGROPECUARIA SAO JOAO",
      "UF_CLIENTE": "SC",
      "ENDERECO": "ESTRADA RURAL",
      "COD_MUN": "4119905",
      "MUNICIPIO": "XANXERE",
      "UF_MUN_CLIENTE": "SC",
      "DDD": "49",
      "TELEFONE": "49988882222",
      "PRIMEIRA_COMPRA": "2023-08-20",
      "ULTIMA_COMPRA": "2023-08-20",
      "NUMERO_DE_COMPRAS": 1,
      "EMAIL": "compras@saojoaoagro.com",
      "TOTAL": 3500000.00,
      "TIPO_VENDA": "FINANCIAMENTO"
    },
    {
      "FILIAL": "1",
      "FABRICANTE": "KUHN",
      "MODELO": "FIGHTER 3000",
      "CATEGORIA": "PULVERIZADOR",
      "ESTADO": "USADO",
      "CODIGO": "M003",
      "CHASSI": "KUHNF3000PULV99",
      "REGIAO": "SUL",
      "QUANTIDADE": 1,
      "COD_VENDEDOR": "V03",
      "NOME_VENDEDOR": "CARLOS REPRESENTANTE",
      "EMISSAO": "2021-02-10",
      "NOTA_FISCAL": "008899",
      "SERIE": "1",
      "UF_NOTA": "RS",
      "COD_CLIENTE": "C003",
      "LOJA_CLIENTE": "01",
      "NOME_CLIENTE": "SILVA AGRONEGOCIOS",
      "UF_CLIENTE": "RS",
      "ENDERECO": "AV DAS LAGOAS",
      "COD_MUN": "4109401",
      "MUNICIPIO": "PASSO FUNDO",
      "UF_MUN_CLIENTE": "RS",
      "DDD": "54",
      "TELEFONE": "54977773333",
      "PRIMEIRA_COMPRA": "2021-02-10",
      "ULTIMA_COMPRA": "2021-02-10",
      "NUMERO_DE_COMPRAS": 1,
      "EMAIL": "diretoria@silva.com",
      "TOTAL": 800000.00,
      "TIPO_VENDA": "CONSÓRCIO"
    }
  ];

  console.log("Upsert Clientes...");
  const res1 = await supabase.from('crm_clientes').insert(clientes.map(c => ({...c, id: crypto.randomUUID()})));
  if (res1.error) console.error("ERRO CLIENTES:", res1.error);
  
  console.log("Upsert Orçamentos...");
  const res2 = await supabase.from('crm_orcamentos').insert(orcamentos.map(o => ({...o, id: crypto.randomUUID()})));
  if (res2.error) console.error("ERRO ORCS:", res2.error);
  
  console.log("Upsert Máquinas...");
  const res3 = await supabase.from('crm_parquemaquinas').insert(maquinas.map(m => ({...m, id: crypto.randomUUID()})));
  if (res3.error) console.error("ERRO MAQUINAS:", res3.error);

  if (!res1.error && !res2.error && !res3.error) {
    console.log("Dados Inseridos com Sucesso no Postgres!");
  }
}

seed();
