const sql = require('mssql');

async function testConnection(domain) {
    const config = {
        user: domain ? `${domain}\\consulta` : 'consulta',
        password: '#bouwman23',
        server: '172.25.100.103',
        database: 'PRD2410',
        options: { encrypt: false, trustServerCertificate: true }
    };
    try {
        await sql.connect(config);
        console.log(`SUCESSO com dominio: ${domain}`);
        process.exit(0);
    } catch (err) {
        console.error(`FALHA com dominio ${domain}:`, err.message);
    }
}

async function run() {
    await testConnection('BOUWMAN');
    await testConnection('bouwman');
}
run();
