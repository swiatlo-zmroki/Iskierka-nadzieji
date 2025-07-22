import { kv } from '@vercel/kv';

// Funkcja do tworzenia "slug" (wersji do linków)
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export default async function handler(request, response) {
    // Jeśli prośba to POST (dodawanie nowej sekcji)
    if (request.method === 'POST') {
        try {
            const { name } = request.body;
            if (!name) {
                return response.status(400).json({ error: 'Nazwa sekcji jest wymagana.' });
            }
            const slug = slugify(name);
            
            // Dodajemy nową sekcję do naszej bazy danych KV
            await kv.hset('sections', { [slug]: { name, slug } });
            
            return response.status(200).json({ message: 'Sekcja dodana pomyślnie!', section: { name, slug } });
        } catch (error) {
            return response.status(500).json({ error: 'Błąd serwera przy dodawaniu sekcji.' });
        }
    }
    // Jeśli prośba to GET (pobieranie listy sekcji)
    else if (request.method === 'GET') {
        try {
            // Pobieramy wszystkie sekcje z bazy
            const sections = await kv.hgetall('sections');
            const sectionsArray = sections ? Object.values(sections) : [];
            
            return response.status(200).json(sectionsArray);
        } catch (error) {
            return response.status(500).json({ error: 'Błąd serwera przy pobieraniu sekcji.' });
        }
    }
    // Jeśli inna metoda
    else {
        return response.status(405).json({ error: 'Metoda nie jest dozwolona.' });
    }
}
