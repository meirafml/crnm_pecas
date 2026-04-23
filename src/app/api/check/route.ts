import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Tenta caminhos diferentes
    const paths = [
      "C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Pecas e Consumiveis\\Tabelas\\ORCAMENTO - tabela nova.xlsx",
      "C:\\Users\\fabiano.luz\\OneDrive - B. J. BOUWMAN E CIA LTDA\\Documentos\\Antigravity - Consultas SQL Peças e Consumíveis\\Tabelas\\ORCAMENTO - tabela nova.xlsx",
      path.join(process.cwd(), '..', 'Tabelas', 'ORCAMENTO - tabela nova.xlsx')
    ];

    let foundPath = null;
    for (const p of paths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json({ error: "Arquivo não encontrado", tried: paths });
    }

    const workbook = xlsx.readFile(foundPath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    
    return NextResponse.json({
      path: foundPath,
      headers: data[0],
      firstRow: data[1]
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack });
  }
}
