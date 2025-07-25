export default async function handler(request, response) {
    try {
        const { kv } = await import('@vercel/kv');
        const kvUrl = process.env.KV_REST_API_URL;
        const kvToken = process.env.KV_REST_API_TOKEN;

        // Próba wykonania prostego odczytu z bazy danych
        let dbConnectionOk = false;
        try {
            await kv.get('test_key'); // próbujemy odczytać cokolwiek
            dbConnectionOk = true;
        } catch (e) {
            dbConnectionOk = false;
        }

        response.status(200).json({
            message: "Odpowiedź od diagnosty v2.",
            hasKvUrl: !!kvUrl,
            hasKvToken: !!kvToken,
            dbConnectionOk: dbConnectionOk
        });

    } catch (error) {
        response.status(500).json({ 
            error: "Krytyczny błąd w pliku diagnostycznym.", 
            message: error.message 
        });
    }
}
