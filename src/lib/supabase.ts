import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipagens baseadas no Dicionário de Dados do ERP Protheus
export interface Cliente {
  id: string;
  FILIAL: string;
  CODIGO_CLIENTE: string;
  LOJA_CLIENTE: string;
  NOME_CLIENTE: string;
  CNPJ_CPF: string;
  CIDADE: string;
  UF: string;
  COD_IBGE: string;
  VENDEDOR_RESP: string;
  NOME_VENDEDOR_RESP: string;
  DDD: string;
  TELEFONE: string;
  CELULAR_WHATSAPP_CONTATO: string;
  EMAIL: string;
  DIAS_SEM_COMPRA: number | null;
  DATA_ULT_COMPRA: string | null;
  NF_12M: number;
  STATUS_BASE: string;
}

export interface Orcamento {
  id: string;
  FILIAL_ORC: string;
  CODIGO_CLIENTE: string;
  LOJA_CLIENTE: string;
  CLIENTE_ORC: string;
  ORC_DATA_EMISSAO_ORCAMENTO: string;
  ORC_DATA_ORCAMENTO: string;
  CODIGO_PRODUTO_ORC: string;
  ORC_NUMERO_ORCAMENTO: string;
  ORC_SALDO_ORCAMENTO: number;
  ORC_VALOR_UNITARIO: number;
  ORC_VALOR_TOTAL: number;
  ORC_CUSTO_PRODUTO: number;
  ORC_CODIGO_VENDEDOR: string;
  ORC_NOME_VENDEDOR: string;
}

export interface Maquina {
  id: string;
  FILIAL: string;
  FABRICANTE: string;
  MODELO: string;
  CATEGORIA: string;
  ESTADO: string;
  CODIGO: string;
  CHASSI: string;
  REGIAO: string;
  QUANTIDADE: number;
  COD_VENDEDOR: string;
  NOME_VENDEDOR: string;
  EMISSAO: string;
  NOTA_FISCAL: string;
  SERIE: string;
  UF_NOTA: string;
  COD_CLIENTE: string;
  LOJA_CLIENTE: string;
  NOME_CLIENTE: string;
  UF_CLIENTE: string;
  ENDERECO: string;
  COD_MUN: string;
  MUNICIPIO: string;
  UF_MUN_CLIENTE: string;
  DDD: string;
  TELEFONE: string;
  PRIMEIRA_COMPRA: string;
  ULTIMA_COMPRA: string;
  NUMERO_DE_COMPRAS: number;
  EMAIL: string;
  TOTAL: number;
  TIPO_VENDA: string;
}
