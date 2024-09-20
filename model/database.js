const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1', //172.25.52.205
  user: 'mandrantofit', //cpadmin
  password: 'abcd1234', //adminplus
  database: 'stock', //stock
});

module.exports = pool;
