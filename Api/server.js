const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const BAZA_PATH = './baza.json';
const UPLOAD_FOLDER = './upload/';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/upload', express.static(UPLOAD_FOLDER));

// Konfiguracja Multer (przechowywanie zdjęć)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Endpoint do dodawania wpisów
app.post('/api/dodaj', (req, res) => {
  const nowyWpis = req.body;

  fs.readFile(BAZA_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Błąd odczytu bazy' });

    let baza = [];
    try {
      baza = JSON.parse(data);
    } catch (e) {
      console.warn('Pusta lub uszkodzona baza, tworzę nową');
    }

    baza.unshift(nowyWpis); // Dodaj na początek

    fs.writeFile(BAZA_PATH, JSON.stringify(baza, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Błąd zapisu bazy' });
      res.json({ status: 'OK', wpis: nowyWpis });
    });
  });
});

// Endpoint do wgrywania zdjęć
app.post('/api/upload', upload.single('zdjecie'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Brak pliku' });

  const filePath = '/upload/' + req.file.filename;
  res.json({ status: 'OK', sciezka: filePath });
});

// Endpoint do pobierania wszystkich wpisów
app.get('/api/wpisy', (req, res) => {
  fs.readFile(BAZA_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Błąd odczytu bazy' });

    let baza = [];
    try {
      baza = JSON.parse(data);
    } catch (e) {
      return res.json([]);
    }

    res.json(baza);
  });
});

app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
