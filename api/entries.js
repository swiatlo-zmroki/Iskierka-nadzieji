import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { section, id } = request.query;

    if (!section) {
        return response.status(400).json({ error: 'Nazwa sekcji jest wymagana.' });
    }

    try {
        switch (request.method) {
            case 'POST': // Dodawanie nowego wpisu
                const { title, content, author } = request.body;
                if (!content) {
                    return response.status(400).json({ error: 'Treść wpisu jest wymagana.' });
                }
                const newId = `entry_${Date.now()}`;
                await kv.hset(`${section}:entries`, { 
                    [newId]: { id: newId, title, content, author, createdAt: new Date().toISOString() }
                });
                return response.status(200).json({ message: 'Wpis dodany pomyślnie!', id: newId });

            case 'GET': // Pobieranie wpisów
                const entries = await kv.hgetall(`${section}:entries`);
                const entriesArray = entries ? Object.values(entries).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
                return response.status(200).json(entriesArray);

            case 'PUT': // Aktualizacja wpisu
                 if (!id) return response.status(400).json({ error: 'ID wpisu jest wymagane.' });
                const updatedData = request.body;
                // Pobieramy stary wpis, żeby go nie nadpisać, a zaktualizować
                const oldEntry = await kv.hget(`${section}:entries`, id);
                if (!oldEntry) return response.status(404).json({ error: 'Wpis nie znaleziony.' });
                
                const updatedEntry = { ...oldEntry, ...updatedData };
                await kv.hset(`${section}:entries`, { [id]: updatedEntry });
                return response.status(200).json({ message: 'Wpis zaktualizowany!' });

            case 'DELETE': // Usuwanie wpisu
                if (!id) return response.status(400).json({ error: 'ID wpisu jest wymagane.' });
                await kv.hdel(`${section}:entries`, id);
                return response.status(200).json({ message: 'Wpis usunięty!' });

            default:
                return response.status(405).json({ error: 'Metoda nie jest dozwolona.' });
        }
    } catch (error) {
        return response.status(500).json({ error: `Błąd serwera: ${error.message}` });
    }
}
