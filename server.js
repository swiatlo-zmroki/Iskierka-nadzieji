const express = require('express');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ dest: 'uploads/' });

const PLIK_JSON = 'dane.json';

// 🖼️ Upload zdjęcia do galerii
app.post('/api/upload-zdjecie', upload.single('zdjecie'), (req, res) => {
  if (!req.file) return res.status(400).send('Brak pliku');
  const imgPath = `/uploads/${req.file.filename}`;
  res.json({ imgPath });
});

// 📥 Zapisz dane z formularza admina
app.post('/api/zapisz', (req, res) => {
  fs.writeFile(PLIK_JSON, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send('Błąd zapisu');
    res.send('Zapisano dane');
  });
});

// 📤 Pobierz dane (dla odczytu na stronie)
app.get('/api/dane', (req, res) => {
  fs.readFile(PLIK_JSON, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Błąd odczytu');
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
