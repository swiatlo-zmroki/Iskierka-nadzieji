import { kv } from '@vercel/kv';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint do dodawania wpisów
app.post('/api/dodaj', async (req, res) => {
    try {
        const nowyWpis = req.body;
        const wpisId = `wpis_${Date.now()}`; // Tworzymy unikalne ID
        nowyWpis.id = wpisId;

        // Zapisujemy nowy wpis do naszej bazy KV
        await kv.hset('wpisy', { [wpisId]: nowyWpis });
        
        res.status(200).json({ status: 'OK', wpis: nowyWpis });
    } catch (error) {
        res.status(500).json({ error: 'Błąd zapisu do bazy KV' });
    }
});

// Endpoint do pobierania wszystkich wpisów
app.get('/api/wpisy', async (req, res) => {
    try {
        // Pobieramy wszystkie wpisy z bazy KV
        const wpisy = await kv.hgetall('wpisy');
        const wpisyArray = wpisy ? Object.values(wpisy).sort((a, b) => b.id.localeCompare(a.id)) : [];
        
        res.status(200).json(wpisyArray);
    } catch (error) {
        res.status(500).json({ error: 'Błąd odczytu z bazy KV' });
    }
});

// Sprawę wgrywania zdjęć rozwiążemy w następnym kroku,
// ponieważ Vercel wymaga do tego innej, specjalnej usługi (Vercel Blob).
// Na razie skupiamy się na danych tekstowych.

// Vercel automatycznie obsłuży uruchomienie tego serwera
export default app;
