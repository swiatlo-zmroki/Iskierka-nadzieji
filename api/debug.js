export default function handler(request, response) {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    response.status(200).json({
        message: "Odpowiedź od diagnosty.",
        hasKvUrl: !!kvUrl,
        hasKvToken: !!kvToken
    });
}
