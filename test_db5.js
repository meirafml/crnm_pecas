const sql = require('mssql');

async function testConnection(password) {
    const config = {
        user: 'consulta',
        password: password,
        server: '172.25.100.103',
        database: 'PRD2410',
        options: { encrypt: false, trustServerCertificate: true }
    };
    try {
        await sql.connect(config);
        console.log("SUCESSO: A SENHA ERA", password);
        process.exit(0);
    } catch (err) {
        console.error(`FALHA com ${password}:`, err.message);
    }
}

async function run() {
    await testConnection('#Bouwman23');
    await testConnection('bouwman23');
    await testConnection('Bouwman23');
}
run();
