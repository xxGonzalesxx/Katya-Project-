import { auth } from '../auth.js';
import { api } from '../api.js';
import { escapeHtml, skeletonCards, emptyState } from '../ui.js';

export function renderHome(container) {
    const user = auth.user;
    const isLoggedIn = auth.isLoggedIn();

    // 1. Верстка главной страницы в стиле Bento Grid + Glassmorphism
    container.innerHTML = `
        <!-- Hero-блок -->
        <section class="card p-4 p-md-5 mb-4 border-0 position-relative overflow-hidden">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2 mb-3 fw-semibold">
                        ✨ Кампус онлайн &middot; 2026
                    </span>
                    <h1 class="display-5 fw-bold text-dark mb-3" style="letter-spacing: -0.03em;">
                        ${isLoggedIn
                            ? `Привет, ${escapeHtml(user.name || user.email.split('@')[0])}!`
                            : 'Добро пожаловать в DormHub'}
                    </h1>
                    <p class="fs-5 text-secondary mb-4">
                        Единая цифровая среда вашего общежития: актуальные новости, правила проживания, график дежурств и быстрые заявки.
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        ${isLoggedIn ? `
                            <a href="#/news" class="btn btn-primary btn-lg px-4">Свежие новости</a>
                            <a href="#/rules" class="btn btn-outline-dark btn-lg px-4">Правила кампуса</a>
                        ` : `
                            <a href="#/login" class="btn btn-primary btn-lg px-4">Войти в личный кабинет</a>
                            <a href="#/rules" class="btn btn-outline-dark btn-lg px-4">Правила проживания</a>
                        `}
                    </div>
                </div>
            </div>
        </section>

        <!-- Bento-сетка быстрых разделов -->
        <section class="row g-3 g-md-4 mb-5">
            <div class="col-md-4">
                <a href="#/news" class="text-decoration-none text-reset">
                    <div class="card card-interactive h-100 p-3">
                        <div class="card-body">
                            <div class="fs-2 mb-2">📢</div>
                            <h5 class="card-title fw-bold">Объявления и события</h5>
                            <p class="card-text text-muted-sm mb-0">
                                Важные уведомления от коменданта, отключения воды и мероприятия студсовета.
                            </p>
                        </div>
                    </div>
                </a>
            </div>

            <div class="col-md-4">
                <a href="#/rules" class="text-decoration-none text-reset">
                    <div class="card card-interactive h-100 p-3">
                        <div class="card-body">
                            <div class="fs-2 mb-2">📋</div>
                            <h5 class="card-title fw-bold">Правила и порядок</h5>
                            <p class="card-text text-muted-sm mb-0">
                                Режим тишины, пропускной режим для гостей и нормы пожарной безопасности.
                            </p>
                        </div>
                    </div>
                </a>
            </div>

            <div class="col-md-4">
                <a href="${isLoggedIn ? '#/news' : '#/login'}" class="text-decoration-none text-reset">
                    <div class="card card-interactive h-100 p-3">
                        <div class="card-body">
                            <div class="fs-2 mb-2">🛠️</div>
                            <h5 class="card-title fw-bold">Сервисы жильца</h5>
                            <p class="card-text text-muted-sm mb-0">
                                ${isLoggedIn
                                    ? `Вы вошли как ${escapeHtml(user.role || 'жилец')}. Все сервисы доступны.`
                                    : 'Авторизуйтесь, чтобы управлять дежурствами, бронью и оплатой.'}
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        </section>

        <!-- Блок последних новостей с бэкенда -->
        <section>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="fw-bold mb-0" style="letter-spacing: -0.02em;">Последние новости</h4>
                <a href="#/news" class="btn btn-link text-decoration-none fw-medium p-0">Все новости &rarr;</a>
            </div>
            <div id="home-news-feed">
                ${skeletonCards(2)}
            </div>
        </section>
    `;

    // 2. Асинхронно подгружаем 2 последние новости
    loadRecentNews();

    // 3. Запускаем живой фон и возвращаем функцию очистки для router.js
    return initDormBackground();
}

/**
 * Подгрузка превью новостей на главную
 */
async function loadRecentNews() {
    const feed = document.getElementById('home-news-feed');
    if (!feed) return;

    try {
        const data = await api.get('/news');
        // Если пользователь уже ушел с главной пока шел запрос — ничего не делаем
        if (!document.body.contains(feed)) return;

        const items = Array.isArray(data) ? data.slice(0, 2) : [];

        if (items.length === 0) {
            feed.innerHTML = emptyState('Пока нет опубликованных новостей');
            return;
        }

        feed.innerHTML = `
            <div class="row g-3">
                ${items.map(item => `
                    <div class="col-md-6">
                        <div class="card h-100 p-3">
                            <div class="card-body d-flex flex-column">
                                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                                    <h6 class="fw-bold mb-0">${escapeHtml(item.title)}</h6>
                                    ${item.createdAt ? `<span class="text-muted-sm text-nowrap">${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>` : ''}
                                </div>
                                <p class="text-muted-sm mb-3 flex-grow-1">
                                    ${escapeHtml((item.content || item.text || '').slice(0, 120))}${(item.content || item.text || '').length > 120 ? '...' : ''}
                                </p>
                                <a href="#/news" class="small fw-semibold text-decoration-none">Читать полностью &rarr;</a>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch {
        if (document.body.contains(feed)) {
            feed.innerHTML = emptyState('Не удалось загрузить ленту новостей');
        }
    }
}

/**
 * Интерактивный Mesh-градиент на Canvas (стиль 2026)
 * Возвращает функцию cleanup() для автоматической остановки при смене страницы
 */
function initDormBackground() {
    document.getElementById('dorm-bg-canvas')?.remove();
    document.body.classList.add('has-animated-bg');

    const canvas = document.createElement('canvas');
    canvas.id = 'dorm-bg-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let rafId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Мягкая современная палитра (индиго, небесный, мятный, теплый лавандовый)
    const palette = ['#dbeafe', '#e0e7ff', '#d1fae5', '#fae8ff', '#fef3c7'];
    const orbs = Array.from({ length: 5 }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.max(width, height) * (0.24 + Math.random() * 0.1),
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        color: palette[i % palette.length],
    }));

    const pointer = { x: width * 0.5, y: height * 0.3 };

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    const handlePointerMove = (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    function drawFrame() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < orbs.length; i++) {
            const orb = orbs[i];
            orb.x += orb.vx;
            orb.y += orb.vy;

            if (orb.x < -120 || orb.x > width + 120) orb.vx *= -1;
            if (orb.y < -120 || orb.y > height + 120) orb.vy *= -1;

            // Первая сфера мягко реагирует на курсор/тач
            if (i === 0) {
                orb.x += (pointer.x - orb.x) * 0.015;
                orb.y += (pointer.y - orb.y) * 0.015;
            }

            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fillStyle = orb.color;
            ctx.fill();
        }
    }

    function loop() {
        drawFrame();
        rafId = requestAnimationFrame(loop);
    }

    // Уважаем системную настройку уменьшения движения
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
        drawFrame();
    } else {
        loop();
    }

    // Функция очистки, которую вызовет router.js при переходе на другую вкладку
    return function cleanup() {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('pointermove', handlePointerMove);
        document.body.classList.remove('has-animated-bg');
        canvas.remove();
    };
}
