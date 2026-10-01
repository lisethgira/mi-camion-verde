/**
 * Carga el script SQL de EcoRuta en Clever Cloud.
 * Uso: npm run seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const sqlPath = path.join(__dirname, '../../docs/04_Base_de_Datos_EcoRuta.sql');
  let sql = fs.readFileSync(sqlPath, 'utf8');

  sql = sql.replace(/DELIMITER\s+\/\//gi, '');
  sql = sql.replace(/DELIMITER\s+;/gi, '');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: Number(process.env.MYSQL_ADDON_PORT) || 3306,
    multipleStatements: true,
  });

  console.log('Conectado a Clever Cloud MySQL...');

  const procMatches = [...sql.matchAll(/CREATE\s+PROCEDURE[\s\S]*?END\s*(?:\/\/|;)/gi)];
  let schemaSql = sql;
  for (const match of procMatches) {
    schemaSql = schemaSql.replace(match[0], '');
  }
  schemaSql = schemaSql.replace(/\/\//g, '');

  console.log('Creando tablas, datos y vistas...');
  await connection.query(schemaSql);

  console.log(`Creando ${procMatches.length} procedimientos...`);
  for (const match of procMatches) {
    const proc = match[0].replace(/END\s*\/\//i, 'END').trim();
    await connection.query(proc);
  }

  const [barrios] = await connection.query('SELECT COUNT(*) AS total FROM barrios');
  const [horarios] = await connection.query('SELECT COUNT(*) AS total FROM horarios');
  console.log(`Listo. Barrios: ${barrios[0].total}, Horarios: ${horarios[0].total}`);

  await connection.end();
}

run().catch((err) => {
  console.error('Error al cargar la base de datos:', err.message);
  process.exit(1);
});
