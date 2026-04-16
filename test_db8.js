const sql = require('mssql');
async function testConnection() {
    const config = {
        user: 'consulta',
        password: '#bouwman23',
        server: '172.25.100.103',
        database: 'PRD2410',
        options: { encrypt: true, trustServerCertificate: true } // encrypt TRUE
    };
    try {
        await sql.connect(config);
        console.log(`SUCESSO COM ENCRYPT!`);
        process.exit(0);
    } catch (err) {
        console.error(`FALHA COM ENCRYPT:`, err.message);
    }
}
testConnection();
