const sql = require('mssql');

async function testConnection() {
    console.log(`Testando com instanceName: 'PRD2410'`);
    const config = {
        user: 'consulta',
        password: '#bouwman23',
        server: '172.25.100.103',
        database: 'PRD2410',
        options: {
            encrypt: false,
            trustServerCertificate: true,
            instanceName: 'PRD2410' // <--- TESTING THIS
        }
    };
    try {
        await sql.connect(config);
        console.log("SUCESSO!");
        process.exit(0);
    } catch (err) {
        console.error("FALHA:", err.message);
    }
}
testConnection();
