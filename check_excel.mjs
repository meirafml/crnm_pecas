import xlsx from 'xlsx';

const filePath = "C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Pecas e Consumiveis\\Tabelas\\ORCAMENTO.xlsx";
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
console.log(data[0]);
