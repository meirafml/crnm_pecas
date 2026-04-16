const sql = require('mssql/msnodesqlv8');

async function testConnection() {
    const connStr = "Driver={SQL Server};Server=172.25.100.103;Database=PRD2410;Uid=consulta;Pwd=#bouwman23;";
    const config = {
        connectionString: connStr
    };
    try {
        console.log("Testando via msnodesqlv8 nativo com Driver padrão...");
        await sql.connect(config);
        console.log("SUCESSO ABSOLUTO ODBC nativo padrão!");
        process.exit(0);
    } catch (err) {
        console.error("FALHA ODBC nativo padrão:", err.message);
    }
}
testConnection();
