import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const API_URL = 'http://localhost:3000/api/sync';
const API_KEY = 'bouwman_sync_ak_7a8b9c0d1e2f3g4h5i';

const DATA_DIR = path.join('..', '..', '..', '..', '..', 'OneDrive - B. J. BOUWMAN E CIA LTDA', 'Documentos', 'Antigravity - Consultas SQL Peças e Consumíveis', 'Tabelas');
// Absolute Path => `C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Peças e Consumíveis\\Tabelas`

async function uploadFile(fileName, tableName) {
  const filePath = "C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Peças e Consumíveis\\Tabelas\\" + fileName;
  
  if (!fs.existsSync(filePath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return;
  }

  console.log(`Lendo ${fileName}...`);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  console.log(`${tableName} carregou ${data.length} registros da planilha. Enviando para a API...`);

  // Enviando em lotes de 1000 para não estourar payload/timeout
  const lotes = [];
  for (let i = 0; i < data.length; i += 1000) {
    lotes.push(data.slice(i, i + 1000));
  }

  for (let i = 0; i < lotes.length; i++) {
    const lote = lotes[i];
    
    // O endpoint espera { Clientes: [] }, { Orcamentos: [] } etc.
    let payloadName = tableName === 'CLIENTE' ? 'Clientes' : tableName === 'ORCAMENTO' ? 'Orcamentos' : 'Maquinas';

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          [payloadName]: lote
        })
      });
      
      const json = await resp.json();
      console.log(`+ Lote ${i + 1}/${lotes.length} (${tableName}): Status ${resp.status}`);
      if (resp.status !== 200) {
        console.error(`Detalhes:`, json.detalhes || json.error);
      }
    } catch (e) {
      console.error(`- Erro fatal no Lote ${i + 1} de ${tableName}: ${e.message}`);
    }
  }
}

async function run() {
  // await uploadFile('CLIENTE.xlsx', 'CLIENTE');
  // await uploadFile('ORCAMENTO.xlsx', 'ORCAMENTO');
  await uploadFile('PARQUEDEMAQUINAS.xlsx', 'PARQUEDEMAQUINAS');
  console.log('Upload finalizado.');
}

run();
