const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;

const { closePool, executeQuery } = require('./db');

// サーバーエラーを処理するhandleServerError()関数を定義
function handleServerError(res, err, message = 'サーバーエラー') {
  res.status(500).json({ message });
  console.error(err);
}

// ToDo情報（タイトルと優先度）を受け取り、新しいデータを追加する。
app.post('/todos', async (req, res) => {
  const { title, priority, status } = req.body;
  try {
    const result = await executeQuery(
      'INSERT INTO todos(title,priority,status) VALUES(?,?,?)',
      [title, priority, status],
    );
    res.status(201).json({ id: result.insertId, title, priority, status });
    console.log('新しいデータを追加しました');
  } catch (err) {
    handleServerError(res, err, 'データ追加に失敗しました');
  }
});

// 全ToDoのデータを取得する。
app.get('/todos', async (req, res) => {
  try {
    const rows = await executeQuery('SELECT * FROM todos');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    handleServerError(res, err, 'データ取得に失敗しました');
  }
});

// ToDo情報（タイトル、優先度、ステータス）とIDを受け取り、指定したIDのToDo情報を更新する。
app.put('/todos/:id', async (req, res) => {
  const { title, priority, status } = req.body;
  try {
    const result = await executeQuery(
      'UPDATE todos SET title=?,priority=?,status=? WHERE id=?',
      [title, priority, status, req.params.id],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: '更新対象のデータが存在しません' });
      return;
    }

    res.status(200).json({ id: req.params.id, title, priority, status });
  } catch (err) {
    handleServerError(res, err, 'データ更新に失敗しました');
  }
});

// 指定したIDのToDoを削除する。
app.delete('/todos/:id', async (req, res) => {
  try {
    const result = await executeQuery('DELETE FROM todos WHERE id=?', [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      res.status(404).json({ error: '消去対象のデータが存在しません' });
      return;
    }

    res.status(200).json({ message: '消去しました' });
  } catch (err) {
    handleServerError(res, err, 'データ消去に失敗しました');
  }
});

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal}。アプリケーションの終了処理中…`);
    await closePool();
    process.exit();
  });
});

app.listen(PORT, () => {
  console.log(`${PORT}番ポートでWebサーバーが起動しました`);
});
