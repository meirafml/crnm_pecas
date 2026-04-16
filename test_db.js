const sql = require('mssql');

const config = {
    user: 'consulta',
    password: '#bouwman23',
    server: '172.25.100.103',
    database: 'PRD2410',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        console.log("Conectando...");
        await sql.connect(config);
        console.log("Conexao 1 SUCESSO!");
        process.exit(0);
    } catch (err) {
        console.error("Conexao 1 falhou:", err.message);
    }
}
testConnection();
