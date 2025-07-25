import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { section, id } = request.query;

    if (!section) {
        return response.status(400).json({ error: 'Nazwa sekcji jest wymagana.' });
    }

    const key = `entries:${section}`; // Klucz dla wpisów danej sekcji

    try {
        let entries = await kv.get(key) || [];

        switch (request.method) {
            case 'POST': // Dodawanie nowego wpisu
                const { title, content, author } = request.body;
                if (!content) return response.status(400).json({ error: 'Treść wpisu jest wymagana.' });
                
                const newId = `entry_${Date.now()}`;
                const newEntry = { id: newId, title, content, author, createdAt: new Date().toISOString() };
                
                entries.unshift(newEntry); // Dodaj na początek listy
                await kv.set(key, entries);
                return response.status(200).json({ message: 'Wpis dodany pomyślnie!', entry: newEntry });

            case 'GET': // Pobieranie wpisów
                return response.status(200).json(entries);

            case 'PUT': // Aktualizacja wpisu
                if (!id) return response.status(400).json({ error: 'ID wpisu jest wymagane.' });
                
                const { content: updatedContent } = request.body;
                const entryIndex = entries.findIndex(entry => entry.id === id);
                if (entryIndex === -1) return response.status(404).json({ error: 'Wpis nie znaleziony.' });

                entries[entryIndex].content = updatedContent;
                await kv.set(key, entries);
                return response.status(200).json({ message: 'Wpis zaktualizowany!' });

            case 'DELETE': // Usuwanie wpisu
                if (!id) return response.status(400).json({ error: 'ID wpisu jest wymagane.' });

                const filteredEntries = entries.filter(entry => entry.id !== id);
                if (filteredEntries.length === entries.length) return response.status(404).json({ error: 'Wpis nie znaleziony.' });

                await kv.set(key, filteredEntries);
                return response.status(200).json({ message: 'Wpis usunięty!' });

            default:
                return response.status(405).json({ error: 'Metoda nie jest dozwolona.' });
        }
    } catch (error) {
        return response.status(500).json({ error: `Błąd serwera: ${error.message}` });
    }
}
