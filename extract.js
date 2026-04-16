const xlsx = require('xlsx');
const fs = require('fs');

const pathTabelas = 'C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Peças e Consumíveis\\Tabelas';

function readFileSlice(filename, limit = 50) {
    const filePath = `${pathTabelas}\\${filename}`;
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return [];
    }
    console.log(`Parsing ${filename}...`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    console.log(`Found ${data.length} rows in ${filename}, slicing to ${limit}`);
    return data.slice(0, limit);
}

try {
    const clientes = readFileSlice('CLIENTE.xlsx', 300);
    const maquinas = readFileSlice('PARQUEDEMAQUINAS.xlsx', 100);
    const orcamentos = readFileSlice('ORCAMENTO.xlsx', 50);

    const tsContent = `export const MOCK_CLIENTES = ${JSON.stringify(clientes, null, 2)};\n\n` +
                      `export const MOCK_MAQUINAS = ${JSON.stringify(maquinas, null, 2)};\n\n` +
                      `export const MOCK_ORCAMENTOS = ${JSON.stringify(orcamentos, null, 2)};\n`;

    fs.writeFileSync('src/lib/mockData.ts', tsContent);
    console.log('Successfully wrote real extract to src/lib/mockData.ts');

} catch(e) {
    console.error('Error:', e);
}
