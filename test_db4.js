const sql = require('mssql');

const config = {
    user: 'consulta',
    password: '#bouwman23',
    server: '172.25.100.103',
    // RETIREI O DATABASE DAQUI
    options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(config).then(() => {
    console.log("SUCESSO SEM DB!");
    process.exit(0);
}).catch(e => {
    console.log("FALHA SEM DB:", e.message);
});
