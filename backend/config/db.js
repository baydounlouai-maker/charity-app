const mysql = require('mysql2/promise');
const { default: CONFIG } = require('./config');

const pool = mysql.createPool(CONFIG.DB);

module.exports = pool;
