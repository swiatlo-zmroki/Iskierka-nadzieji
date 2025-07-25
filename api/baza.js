// To jest nasz nowy, uniwersalny "pomocnik" do obsługi bazy danych.
export default async function handler(request, response) {
    // --- BEZPOŚREDNIE POŁĄCZENIE Z BAZĄ DANYCH ---
    const { KV_REST_API_URL, KV_REST_API_TOKEN } = process.env;
    
    // Funkcja do wysyłania komend do bazy
    async function kv(command, ...args) {
        const cmd = [command, ...args].map(encodeURIComponent).join('/');
        const res = await fetch(`${KV_REST_API_URL}/${cmd}`, {
            headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
        });
        const data = await res.json();
        return data.result;
    }
    // --- KONIEC POŁĄCZENIA ---

    const { section, id } = request.query;

    try {
        switch (request.method) {
            case 'POST':
                if (section === 'sections') { // Dodawanie sekcji
                    const { name } = request.body;
                    const slug = name.toString().toLowerCase().replace(/\s+/g, '-');
                    await kv('HSET', 'sections', slug, JSON.stringify({ name, slug }));
                    return response.status(200).json({ message: 'Sekcja dodana!' });
                } else { // Dodawanie wpisu
                    const key = `entries:${section}`;
                    const { title, content, author } = request.body;
                    const newId = `entry_${Date.now()}`;
                    const newEntry = { id: newId, title, content, author, createdAt: new Date().toISOString() };
                    await kv('HSET', key, newId, JSON.stringify(newEntry));
                    return response.status(200).json({ message: 'Wpis dodany!' });
                }

            case 'GET':
                 if (section === 'sections') { // Pobieranie sekcji
                    const sectionData = await kv('HGETALL', 'sections');
                    const sections = [];
                    for(let i = 0; i < sectionData.length; i += 2) {
                        sections.push(JSON.parse(sectionData[i+1]));
                    }
                    return response.status(200).json(sections);
                } else { // Pobieranie wpisów
                    const key = `entries:${section}`;
                    const entryData = await kv('HGETALL', key);
                    const entries = [];
                    for(let i = 0; i < entryData.length; i += 2) {
                        entries.push(JSON.parse(entryData[i+1]));
                    }
                    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    return response.status(200).json(entries);
                }
            
            // Logika dla PUT i DELETE będzie dodana w następnym kroku, żeby uprościć.
            default:
                return response.status(405).json({ error: 'Metoda nie jest dozwolona.' });
        }
    } catch (error) {
        return response.status(500).json({ error: `Błąd serwera: ${error.message}` });
    }
}
