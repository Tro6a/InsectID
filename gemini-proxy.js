const fetch = require('node-fetch');

// Ключ API считывается из переменной окружения, установленной в Netlify
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event, context) => {
    // Проверяем, что используется метод POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed" }),
        };
    }

    // Проверяем наличие ключа
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API key missing on server." }),
        };
    }

    try {
        // Парсим тело запроса, которое прислал клиент (фронтенд)
        const payload = JSON.parse(event.body);

        // Формируем конечный URL для API Gemini, добавляя ключ на стороне сервера
        const apiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
        const model = "gemini-2.5-flash-preview-09-2025";
        const targetUrl = `${apiBaseUrl}/${model}:generateContent?key=${GEMINI_API_KEY}`;

        // Отправляем запрос
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Возвращаем ответ клиенту с тем же статусом, что и от API Gemini
        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Proxy function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Proxy failed to process request.", details: error.message }),
        };
    }
};