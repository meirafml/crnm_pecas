const sql = require('mssql');

async function testODBCString() {
    // String exata que os drivers nativos do Windows / Python usaram
    const connString = "Server=SRV-103;Database=PRD2410;User Id=consulta;Password=#bouwman23;Encrypt=false;TrustServerCertificate=true;";
    try {
        console.log("Testando Connection String com SRV-103...");
        const pool = await sql.connect(connString);
        console.log("SUCESSO ABSOLUTO com SRV-103 !");
        process.exit(0);
    } catch (err) {
        console.error("FALHA SRV-103:", err.message);
    }
}

async function testODBCString2() {
    // String exata com o IP em vez do nome e Instancia
    const connString = "Server=SRV-103\\PRD2410;Database=PRD2410;User Id=consulta;Password=#bouwman23;Encrypt=false;TrustServerCertificate=true;";
    try {
        console.log("Testando Connection String com SRV-103\\PRD2410...");
        const pool = await sql.connect(connString);
        console.log("SUCESSO ABSOLUTO com SRV-103\\PRD2410 !");
        process.exit(0);
    } catch (err) {
        console.error("FALHA SRV-103\\PRD2410:", err.message);
    }
}

async function run() {
    try { await testODBCString(); } catch(e){}
    try { await testODBCString2(); } catch(e){}
}
run();
