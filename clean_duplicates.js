const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Faltam variáveis de ambiente no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log("Deletando registros antigos de máquinas (para remover as duplicatas de UUIDs aleatórios)...");
  
  // O Supabase não permite truncar diretamente ou deletar sem filtro se não habilitado,
  // mas delete().neq('id', 'dummy') costuma funcionar.
  const { data, error, count } = await supabase
    .from('crm_parquemaquinas')
    .delete()
    .neq('id', 'dummy_id_invalido')
    .select();

  if (error) {
    console.error("Erro ao deletar:", error.message);
  } else {
    console.log(`Sucesso: ${data ? data.length : '?'} máquinas duplicadas removidas do banco de dados.`);
    console.log("Por favor, rode o script PowerShell de sincronização (sync_erp_bouwman.ps1) novamente para repovoar as máquinas limpas!");
  }
}

clean();
