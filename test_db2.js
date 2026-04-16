const sql = require('mssql');

async function testConnection(password) {
    console.log(`\nTestando com a senha: ${password}`);
    const config = {
        user: 'consulta',
        password: password,
        server: '172.25.100.103',
        options: { encrypt: false, trustServerCertificate: true }
    };
    try {
        await sql.connect(config);
        console.log("SUCESSO!");
        process.exit(0);
    } catch (err) {
        console.error("FALHA:", err.message);
    }
}
testConnection('bouwman23').then(() => testConnection('Bouwman23')).then(() => testConnection('PRD2410'));
