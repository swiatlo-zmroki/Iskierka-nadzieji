import { kv } from '@vercel/kv';

// Funkcja do tworzenia "slug" (wersji do linków), np. "Moje Wiersze" -> "moje-wiersze"
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export default async function handler(request, response) {
    // --- OBSŁUGA DODAWANIA NOWEJ SEKCJI ---
    if (request.method === 'POST') {
        try {
            const { name } = request.body;
            if (!name) {
                return response.status(400).json({ error: 'Nazwa sekcji jest wymagana.' });
            }
            const slug = slugify(name);
            
            // Pobieramy aktualną listę sekcji
            let sections = await kv.get('sections') || [];
            // Dodajemy nową sekcję
            sections.push({ name, slug });
            // Zapisujemy zaktualizowaną listę
            await kv.set('sections', sections);
            
            return response.status(200).json({ message: 'Sekcja dodana pomyślnie!', section: { name, slug } });
        } catch (error) {
            return response.status(500).json({ error: 'Błąd serwera przy dodawaniu sekcji.' });
        }
    }
    // --- OBSŁUGA POBIERANIA LISTY SEKCJI ---
    else if (request.method === 'GET') {
        try {
            const sections = await kv.get('sections') || [];
            return response.status(200).json(sections);
        } catch (error) {
            return response.status(500).json({ error: 'Błąd serwera przy pobieraniu sekcji.' });
        }
    }
    // --- GDY METODA JEST INNA NIŻ POST LUB GET ---
    else {
        return response.status(405).json({ error: 'Metoda nie jest dozwolona.' });
    }
}
