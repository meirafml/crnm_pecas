import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log("Conectando ao Supabase...");
  
  const [cli, orc, maq] = await Promise.all([
    supabase.from('crm_clientes').select('id', { count: 'exact', head: true }),
    supabase.from('crm_orcamentos').select('id', { count: 'exact', head: true }),
    supabase.from('crm_parquemaquinas').select('id', { count: 'exact', head: true }),
  ]);

  console.log("-----------------------------------------");
  console.log(`Clientes Carregados: ${cli.count || 0}`);
  console.log(`Orçamentos Carregados: ${orc.count || 0}`);
  console.log(`Máquinas Carregadas: ${maq.count || 0}`);
  console.log("-----------------------------------------");
  
  if ((cli.count || 0) > 0) {
    const { data } = await supabase.from('crm_clientes').select('NOME_CLIENTE, DIAS_SEM_COMPRA').limit(3);
    console.log("Amostra Clientes:");
    console.table(data);
  }
}

checkData();
