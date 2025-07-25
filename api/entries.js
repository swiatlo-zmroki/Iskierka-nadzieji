import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { section, id } = request.query;

    if (!section) {
        return response.status(400).json({ error: 'Nazwa sekcji jest wymagana.' });
    }

    const key = `entries:${section}`; // Klucz dla wpisów danej sekcji

    try {
        switch (request.method) {
            case 'POST': // Dodawanie nowego wpisu
                const { title, content, author } = request.body;
                if (!content) {
                    return response.status(400).json({ error: 'Treść wpisu jest wymagana.' });
                }
                const newId = `entry_${Date.now()}`;
                const newEntry = { id: newId, title, content, author, createdAt: new Date().toISOString() };
                
                let entries = await kv.get(key) || [];
                entries.unshift(newEntry); // Dodaj na początek listy
                await kv.set(key, entries);

                return response.status(200).json({ message: 'Wpis dodany pomyślnie!', entry: newEntry });

            case 'GET': // Pobieranie wpisów
                const allEntries = await kv.get(key) || [];
                return response.status(200).json(allEntries);

            default:
                return response.status(405).json({ error: 'Metoda nie jest dozwolona.' });
        }
    } catch (error) {
        return response.status(500).json({ error: `Błąd serwera: ${error.message}` });
    }
}
