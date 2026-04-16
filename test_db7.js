const sql = require('mssql');

async function testConnection() {
    const config = {
        user: 'consulta',
        password: '#bouwman23',
        server: '172.25.100.103',
        database: 'PRD2410',
        domain: 'BOUWMAN', // NTLM domain property
        options: { encrypt: false, trustServerCertificate: true }
    };
    try {
        await sql.connect(config);
        console.log(`SUCESSO NTLM!`);
        process.exit(0);
    } catch (err) {
        console.error(`FALHA NTLM:`, err.message);
    }
}
testConnection();
