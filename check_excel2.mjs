import fs from 'fs';
import xlsx from 'xlsx';

try {
  const filePath = "C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Pecas e Consumiveis\\Tabelas\\ORCAMENTO - tabela nova.xlsx";
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  console.log("HEADERS_EXCEL:", data[0]);
  
  // Imprimir a primeira linha de dados para ver os valores de Status
  console.log("FIRST_ROW:", data[1]);
} catch (e) {
  console.error("ERRO:", e);
}
