const fs = require('fs');
const xlsx = require('xlsx');

console.log('Lendo Excels...');
const cWb = xlsx.readFile('../Tabelas/CLIENTE.xlsx');
const mWb = xlsx.readFile('../Tabelas/PARQUEDEMAQUINAS.xlsx');
const oWb = xlsx.readFile('../Tabelas/ORCAMENTO.xlsx');

const clientes = xlsx.utils.sheet_to_json(cWb.Sheets[cWb.SheetNames[0]])
  .filter(c => c['DIAS_SEM_COMPRA']);

const maquinas = xlsx.utils.sheet_to_json(mWb.Sheets[mWb.SheetNames[0]]);

const orcamentos = xlsx.utils.sheet_to_json(oWb.Sheets[oWb.SheetNames[0]]);

const fileContent = `export const MOCK_CLIENTES = ${JSON.stringify(clientes, null, 2)};

export const MOCK_MAQUINAS = ${JSON.stringify(maquinas, null, 2)};

export const MOCK_ORCAMENTOS = ${JSON.stringify(orcamentos, null, 2)};
`;

fs.writeFileSync('./src/lib/mockData.ts', fileContent);
console.log('Dados atualizados com 500 registros variados!');
