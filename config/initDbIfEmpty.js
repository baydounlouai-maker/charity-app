const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDbIfEmpty() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = 'users'`
  );
  if (rows[0].cnt > 0) return;

  console.log('[startup] database is empty — running init.sql');

  const initSqlFilePath = path.join(__dirname, 'init.sql');
  const initSql = fs.readFileSync(initSqlFilePath, 'utf8');
  const initSqlStatements = splitSqlStatements(initSql);

  for (const statement of initSqlStatements) {
    await pool.execute(statement);
  }

  console.log('[startup] schema initialised');
}

function splitSqlStatements(sql) {
    return sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE ') && !s.startsWith('CREATE DATABASE '));
}

module.exports = initDbIfEmpty;
