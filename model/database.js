const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1', //172.25.52.205
  user: 'root', //cpadmin
  password: '', //adminplus
  database: 'stock', //stock
});

module.exports = pool;