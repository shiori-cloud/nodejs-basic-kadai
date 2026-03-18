const mysql = require('mysql2/promise');

const dbConfig = {
  port: 3306,
  database: 'nodejs_db_kadai',
  user: 'root',
  password: '',
  host: 'localhost',
};

// DB接続プールの作成
const pool = mysql.createPool(dbConfig);

// DB接続プールを破棄するclosePool()関数の定義
async function closePool() {
  try {
    await pool.end();
    console.log('DBが正常に終了されました');
  } catch (err) {
    console.error(err);
  }
}

// SQL文を実行するexecuteQuery()関数の定義
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// closePool()関数とexecuteQuery()関数のエクスポート
module.exports = {
  closePool,
  executeQuery,
};
