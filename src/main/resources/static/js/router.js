import { auth } from './auth.js';

const routes = {};
let currentCleanup = null; // Хранит функцию очистки предыдущей страницы

/**
 * Регистрация маршрута
 * @param {string} path - путь, например '/home'
 * @param {Function} renderFn - функция рендера (может возвращать функцию cleanup)
 * @param {Object} options - опции доступа: { auth: true, admin: true }
 */
export function register(path, renderFn, options = {}) {
    routes[path] = { render: renderFn, options };
}

export function startRouter() {
    window.addEventListener('hashchange', navigate);
    navigate();
}

function navigate() {
    // Отделяем чистый путь от query-параметров (например, #/news?page=2 -> /news)
    const rawHash = location.hash.slice(1) || '/home';
    const [path, queryString] = rawHash.split('?');
    const params = Object.fromEntries(new URLSearchParams(queryString || ''));

    const route = routes[path];
    const app = document.getElementById('app');
    if (!app) return;

    // 1. Вызываем очистку предыдущей страницы (останавливаем анимацию фона, снимаем события)
    if (typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
    }

    // 2. Обработка 404
    if (!route) {
        app.innerHTML = `
            <div class="card p-5 text-center my-4 mx-auto" style="max-width: 480px;">
                <h1 class="display-4 fw-bold text-primary mb-2">404</h1>
                <h5 class="fw-semibold mb-3">Страница не найдена</h5>
                <p class="text-muted-sm mb-4">Возможно, ссылка устарела или раздел был перемещен.</p>
                <a href="#/home" class="btn btn-primary px-4">Вернуться на главную</a>
            </div>
        `;
        return;
    }

    // 3. Проверка прав доступа (Route Guards)
    if (route.options.auth && !auth.isLoggedIn()) {
        location.hash = '#/login';
        return;
    }

    if (route.options.admin && !auth.isAdmin()) {
        location.hash = '#/home';
        return;
    }

    // 4. Перезапускаем плавную CSS-анимацию появления <main> при каждом переходе
    app.style.animation = 'none';
    app.offsetHeight; // форсируем reflow
    app.style.animation = '';

    // 5. Рендерим новую страницу и сохраняем её функцию очистки (если она есть)
    app.innerHTML = '';
    const cleanup = route.render(app, params);
    if (typeof cleanup === 'function') {
        currentCleanup = cleanup;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
}
