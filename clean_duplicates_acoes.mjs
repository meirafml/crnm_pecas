import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      process.env[match[1].trim()] = val;
    }
  });
} catch (e) { dotenv.config(); }

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clean() {
  console.log("Limpando ações duplicadas geradas pelo erro do cron...");
  const { data: acoes, error } = await supabase.from('crm_acoes').select('*').eq('origem', 'SISTEMA_AUTO');
  
  if (error) { console.error(error); return; }

  const mantidas = new Set();
  const paraDeletar = [];

  for (const a of acoes) {
    const key = `${a.tipo}_${a.numero_orcamento || ''}_${a.codigo_cliente || ''}`;
    if (mantidas.has(key)) {
      paraDeletar.push(a.id);
    } else {
      mantidas.add(key);
    }
  }

  if (paraDeletar.length > 0) {
    console.log(`Deletando ${paraDeletar.length} ações duplicadas...`);
    // Delete in chunks
    for (let i = 0; i < paraDeletar.length; i += 100) {
      const chunk = paraDeletar.slice(i, i + 100);
      await supabase.from('crm_acoes').delete().in('id', chunk);
    }
    console.log("Limpeza concluída!");
  } else {
    console.log("Nenhuma duplicada encontrada.");
  }
}
clean();
