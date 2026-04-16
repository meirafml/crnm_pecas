const sql = require('mssql/msnodesqlv8');

async function testConnection() {
    const connStr = "Driver={ODBC Driver 17 for SQL Server};Server=SRV-103;Database=PRD2410;Uid=consulta;Pwd=#bouwman23;Encrypt=yes;TrustServerCertificate=yes;";
    const config = {
        connectionString: connStr
    };
    try {
        console.log("Testando via msnodesqlv8 nativo ODBC...");
        await sql.connect(config);
        console.log("SUCESSO ABSOLUTO ODBC nativo!");
        process.exit(0);
    } catch (err) {
        console.error("FALHA ODBC nativo:", err.message);
    }
}
testConnection();
