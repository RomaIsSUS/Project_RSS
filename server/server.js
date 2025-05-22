const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public')); // здесь будет index.html
app.use(express.json());

const db = mysql.createConnection({
  host: '127.0.0.1',     // из твоего скрина
  user: 'root',          // root
  password: '2006',          // если нет пароля, оставь пустым
  database: 'ictproj',      // мы создали эту базу в Шаге 2
  port: 3306             // по умолчанию MySQL порт
});

db.connect(err => {
  if (err) {
    console.error('❌ Ошибка подключения к базе данных:', err);
    return;
  }
  console.log('✅ Подключено к MySQL');
});

app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Ошибка при получении данных:', err);
      return res.status(500).json({ error: 'Ошибка при получении данных' });
    }
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('🚀 Сервер запущен на http://localhost:3000');
});