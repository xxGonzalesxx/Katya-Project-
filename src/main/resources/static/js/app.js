import { register, startRouter } from './router.js';
import { auth } from './auth.js';
import { renderHome } from './pages/home.js';
import { renderRules } from './pages/rules.js';
import { renderLogin } from './pages/login.js';
import { renderNews } from './pages/news.js';

// Регистрация маршрутов
register('/home', renderHome);
register('/rules', renderRules);
register('/login', renderLogin);
register('/news', renderNews);

// Инициализация интерфейса
renderNavbar();
setupMobileMenuAutoClose();
window.addEventListener('hashchange', updateActiveNavLink);

startRouter();
updateActiveNavLink();

/**
 * Рендер навигации (можно вызывать повторно после логина/логаута)
 */
export function renderNavbar() {
    const links = document.getElementById('nav-links');
    const authBox = document.getElementById('nav-auth');
    if (!links || !authBox) return;

    const user = auth.user;

    links.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="#/home">Главная</a></li>
        <li class="nav-item"><a class="nav-link" href="#/news">Новости</a></li>
        <li class="nav-item"><a class="nav-link" href="#/rules">Правила</a></li>
    `;

    authBox.innerHTML = ''; // Очищаем блок безопасно

    if (user) {
        const emailBadge = document.createElement('span');
        emailBadge.className = 'text-light-emphasis small me-2';
        emailBadge.textContent = user.email; // Защита от XSS

        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline-light btn-sm';
        logoutBtn.textContent = 'Выйти';
        logoutBtn.addEventListener('click', () => {
            auth.logout();
            renderNavbar(); // Перерисовываем шапку без перезагрузки страницы
            location.hash = '#/home';
        });

        authBox.append(emailBadge, logoutBtn);
    } else {
        authBox.innerHTML = `<a href="#/login" class="btn btn-primary btn-sm px-3">Войти</a>`;
    }

    updateActiveNavLink();
}

/**
 * Подсветка активного пункта меню в навбаре
 */
function updateActiveNavLink() {
    const currentHash = location.hash || '#/home';
    document.querySelectorAll('#nav-links .nav-link').forEach((link) => {
        const isActive = currentHash.startsWith(link.getAttribute('href'));
        link.classList.toggle('active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * Автоматически сворачивает бургер-меню на мобильных при клике по ссылке
 */
function setupMobileMenuAutoClose() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    navMenu.addEventListener('click', (e) => {
        if (e.target.closest('a, button') && navMenu.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
            bsCollapse.hide();
        }
    });
}
