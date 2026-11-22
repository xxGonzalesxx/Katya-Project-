import { auth } from './auth.js';

const BASE = '/api';
const DEFAULT_TIMEOUT = 10000; // 10 секунд

async function request(method, path, body, options = {}) {
    const isFormData = body instanceof FormData;
    const headers = { ...options.headers };

    // Ставим JSON только если это не FormData и есть тело запроса
    if (!isFormData && body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
    }

    let res;
    try {
        res = await fetch(BASE + path, {
            method,
            headers,
            body: body === undefined ? undefined : (isFormData ? body : JSON.stringify(body)),
            // Защита от бесконечного зависания сети
            signal: options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT),
        });
    } catch (err) {
        if (err.name === 'TimeoutError') {
            throw new Error('Превышено время ожидания ответа от сервера');
        }
        if (err.name === 'AbortError') {
            throw err; // Запрос отменен намеренно (например, при переходе со страницы)
        }
        throw new Error('Сервер недоступен. Проверьте подключение к интернету');
    }

    if (res.status === 401) {
        auth.logout();
        if (!location.hash.startsWith('#/login')) {
            location.hash = '#/login';
        }
        throw new Error('Сессия истекла. Войдите снова');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Ошибка сервера (${res.status})`);
    }

    if (res.status === 204) return null;

    // Безопасный парсинг на случай 200 OK с пустым телом
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export const api = {
    get:    (p, opts)       => request('GET', p, undefined, opts),
    post:   (p, body, opts) => request('POST', p, body, opts),
    put:    (p, body, opts) => request('PUT', p, body, opts),
    patch:  (p, body, opts) => request('PATCH', p, body, opts),
    delete: (p, opts)       => request('DELETE', p, undefined, opts),
};
