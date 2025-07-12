const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const path = require('path');

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تقديم الملفات الثابتة من مجلد المشروع
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/danke.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'danke.html'));
});

app.post('/neu_anmelden', async (req, res) => {
  const { u_name, password } = req.body;

  if (!u_name || !password || u_name.trim() === '' || password.trim() === '') {
    return res.status(400).json({ error: 'الاسم وكلمة المرور مطلوبان' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE name=$1', [u_name.trim()]);

   if (existingUser.rows.length > 0) {
     return res.status(409).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    await pool.query('INSERT INTO users (name, password) VALUES ($1, $2)', [u_name.trim(), password.trim()]);

    res.status(201).json({ message: 'شكرا تم تأكيد الحساب بنجاح ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء التسجيل' });
  }
});

app.listen(3000, () => {
  console.log('server is running on http://localhost:3000');
});
